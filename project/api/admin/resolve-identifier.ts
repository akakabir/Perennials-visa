import { adminDb } from '../_firebaseAdmin';
import { checkRateLimit, getClientIp } from '../_rateLimit';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 30 lookups per minute per IP
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`resolve:${ip}`, 30, 60);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many attempts. Please try again in a moment.' });
  }

  const { identifier } = req.body || {};
  if (!identifier || typeof identifier !== 'string') {
    return res.status(400).json({ error: 'Please provide a username or email address.' });
  }

  const clean = identifier.trim().toLowerCase();

  // If already an email, return immediately
  if (clean.includes('@')) {
    return res.status(200).json({ email: clean });
  }

  try {
    const adminsSnap = await adminDb.collection('admins').get();
    for (const doc of adminsSnap.docs) {
      const data = doc.data();
      if (!data) continue;

      const email = (data.email || '').toLowerCase().trim();
      const username = (data.username || '').toLowerCase().trim();
      const name = (data.name || '').toLowerCase().trim();
      const emailPrefix = email.split('@')[0];

      if (clean === username || clean === emailPrefix || clean === name) {
        return res.status(200).json({ email: data.email });
      }
    }

    // Default fallback if not found in database
    return res.status(200).json({ email: clean });
  } catch (err: any) {
    console.error('Resolve identifier error:', err);
    return res.status(500).json({ error: 'Failed to resolve login identifier.' });
  }
}
