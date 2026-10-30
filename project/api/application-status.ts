import { adminDb } from './_firebaseAdmin';
import { checkRateLimit, getClientIp } from './_rateLimit';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(`app_status:${clientIp}`, 30, 600); // 30 requests per 10 mins
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Too many status check requests. Please try again later.' });
  }

  const ref = req.query?.ref;
  if (!ref || typeof ref !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid application reference ID.' });
  }

  const cleanRef = ref.trim();
  if (cleanRef.length > 64) {
    return res.status(400).json({ error: 'Invalid reference ID format.' });
  }

  try {
    const snap = await adminDb.collection('applications')
      .where('referenceId', '==', cleanRef)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: 'No application found with the provided reference ID.' });
    }

    const appDoc = snap.docs[0].data();

    // Look up plan name
    let planName = appDoc.planId || 'Standard Visa';
    if (appDoc.planId) {
      try {
        const planDoc = await adminDb.collection('visaPlans').doc(appDoc.planId).get();
        if (planDoc.exists && planDoc.data()?.name) {
          planName = planDoc.data()?.name;
        }
      } catch {
        // Fallback to stored planId
      }
    }

    // Extract applicant first name only for privacy
    const fullName = (appDoc.name || '').trim();
    const firstName = fullName.split(' ')[0] || 'Applicant';

    // Strictly returns ONLY: referenceId, applicant first name, plan name, status
    return res.status(200).json({
      referenceId: appDoc.referenceId,
      firstName,
      planName,
      status: appDoc.status
    });
  } catch (err: any) {
    console.error('Error fetching application status:', err);
    return res.status(500).json({ error: 'Failed to look up application status.' });
  }
}
