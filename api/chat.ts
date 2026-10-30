import { adminDb } from './_firebaseAdmin.js';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Origin verification
  const origin = req.headers?.origin || req.headers?.referer || '';
  const appUrl = process.env.APP_URL || '';
  const isDev = process.env.NODE_ENV !== 'production';

  if (appUrl) {
    let allowed = false;
    try {
      const appUrlHost = new URL(appUrl).host;
      if (origin) {
        const originHost = new URL(origin).host;
        if (originHost === appUrlHost) allowed = true;
      }
    } catch {
      // url parse error
    }

    if (isDev && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      allowed = true;
    }

    // In preview / cloud run environments, allow if matching preview/dev domain or appUrl
    if (!allowed && !isDev) {
      return res.status(403).json({ error: 'Forbidden: Origin verification failed.' });
    }
  }

  // 2. Rate limiting: 20 requests per 10 minutes per IP
  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(`chat:${clientIp}`, 20, 600);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many messages sent. Please wait a few minutes before asking another question.'
    });
  }

  // 3. Validate messages array
  const rawMessages = req.body?.messages;
  if (!rawMessages || !Array.isArray(rawMessages)) {
    return res.status(400).json({ error: 'Invalid messages array.' });
  }

  if (rawMessages.length > 20) {
    return res.status(400).json({ error: 'Maximum 20 messages per conversation session.' });
  }

  // Reject non-string content and enforce 1,000 char limit per message
  for (const m of rawMessages) {
    if (!m || typeof m.content !== 'string' || typeof m.role !== 'string') {
      return res.status(400).json({ error: 'Invalid message payload format.' });
    }
    if (m.content.length > 1000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 1,000 characters.' });
    }
  }

  // 4. Drop any client-supplied 'system' messages!
  const sanitizedMessages = rawMessages
    .filter((m: any) => m.role !== 'system')
    .map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).trim()
    }));

  // 5. Read active visa plans to build authentic server-side system prompt
  let plansContext = '';
  try {
    const plansSnap = await adminDb.collection('visaPlans')
      .where('status', '==', 'active')
      .get();

    if (!plansSnap.empty) {
      const planSummaries = plansSnap.docs.map((doc: any) => {
        const p = doc.data();
        return `• ${p.name || ''} (${p.destinationCountry || ''}): ${p.description || ''} | Requirements: ${(p.requirements || []).join(', ')} | Processing: ${p.processingTime || 'Standard'}`;
      });
      plansContext = `Current Active Visa Plans offered:\n${planSummaries.join('\n')}`;
    }
  } catch (err) {
    console.warn('Could not read visaPlans for chat prompt:', err);
  }

  const serverSystemPrompt = {
    role: 'system',
    content: `You are the official AI visa consultant assistant for Perennials Visa.
Your tone is professional, warm, and helpful.
Provide accurate information about visa options, travel requirements, documentation guidance, and the Perennials Visa consultation process.
Do NOT give definitive legal promises; state that visas are granted at the discretion of the respective immigration authorities.
Never quote hardcoded fees; mention that consultation and service fees are discussed and arranged directly with a Perennials Visa specialist via WhatsApp.
${plansContext}
Keep responses concise, clear, and under 150 words.`
  };

  const fullMessages = [serverSystemPrompt, ...sanitizedMessages];

  // 6. Call Groq API
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
  }

  try {
    let groqModel = (process.env.GROQ_MODEL || 'openai/gpt-oss-20b').trim();
    if (groqModel.startsWith('chatgpt/')) {
      groqModel = groqModel.replace(/^chatgpt\//, 'openai/');
    }
    if (groqModel === 'openai/oss-120b') {
      groqModel = 'openai/gpt-oss-120b';
    }
    if (groqModel === 'openai/oss-20b') {
      groqModel = 'openai/gpt-oss-20b';
    }

    const callGroq = async (model: string) => {
      return fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: fullMessages,
          max_tokens: 300,
          temperature: 0.7
        })
      });
    };

    let response = await callGroq(groqModel);

    // If model not found (404) or bad request due to model (400), fall back to openai/gpt-oss-20b
    if (!response.ok && (response.status === 404 || response.status === 400) && groqModel !== 'openai/gpt-oss-20b') {
      console.warn(`Groq model '${groqModel}' returned ${response.status}, falling back to 'openai/gpt-oss-20b'`);
      response = await callGroq('openai/gpt-oss-20b');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      return res.status(response.status).json({
        error: response.status === 429
          ? 'The AI assistant is temporarily busy. Please wait a moment and try again.'
          : 'Failed to generate response from AI assistant.'
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Groq proxy error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred while contacting AI services.' });
  }
}
