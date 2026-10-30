import { adminDb, verifyAdminRequest } from '../_firebaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callingAdmin = await verifyAdminRequest(req);
  if (!callingAdmin) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required.' });
  }

  const { uid } = req.body || {};
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing admin UID.' });
  }

  if (uid === callingAdmin.uid) {
    return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  }

  try {
    await adminDb.collection('admins').doc(uid).delete();
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete admin doc:', err);
    return res.status(500).json({ error: 'Failed to delete administrator account.' });
  }
}
