import { adminDb } from './_firebaseAdmin.js';

let lastLoggedTime = 0;

export default async function handler(req: any, res: any) {
  const timestamp = new Date().toISOString();
  const latencies: Record<string, number> = {};
  const services: Record<string, 'operational' | 'degraded' | 'outage'> = {
    server: 'operational'
  };

  // 1. Check Database (Firestore lightweight read)
  const startDb = Date.now();
  try {
    const snap = await adminDb.collection('siteSettings').doc('global').get();
    latencies.database = Date.now() - startDb;
    services.database = latencies.database > 2000 ? 'degraded' : 'operational';
  } catch (dbErr: any) {
    console.error('Database health check failed:', dbErr);
    latencies.database = Date.now() - startDb;
    services.database = 'outage';
  }

  // 2. Check AI Assistant (Groq reachability with 3s timeout)
  const groqKey = process.env.GROQ_API_KEY;
  const startGroq = Date.now();

  if (!groqKey) {
    services.ai_proxy = 'outage';
    latencies.ai_proxy = 0;
  } else {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${groqKey}`
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      latencies.ai_proxy = Date.now() - startGroq;
      if (groqRes.ok) {
        services.ai_proxy = latencies.ai_proxy > 2000 ? 'degraded' : 'operational';
      } else {
        services.ai_proxy = 'outage';
      }
    } catch (groqErr: any) {
      latencies.ai_proxy = Date.now() - startGroq;
      services.ai_proxy = 'outage';
    }
  }

  // 3. Overall status calculation
  let overallStatus: 'operational' | 'degraded' | 'outage' = 'operational';
  if (services.database === 'outage' || services.server === 'outage') {
    overallStatus = 'outage';
  } else if (services.ai_proxy === 'outage' || services.database === 'degraded' || services.ai_proxy === 'degraded') {
    overallStatus = 'degraded';
  }

  // 4. Record status check at most once per 5 minutes to statusChecks collection
  const now = Date.now();
  if (now - lastLoggedTime >= 300000) { // 5 minutes
    lastLoggedTime = now;
    adminDb.collection('statusChecks').add({
      timestamp,
      status: overallStatus,
      services,
      latencies
    }).catch((err: any) => console.warn('Could not write statusCheck log:', err));
  }

  return res.status(200).json({
    status: overallStatus,
    services,
    latencies,
    timestamp
  });
}
