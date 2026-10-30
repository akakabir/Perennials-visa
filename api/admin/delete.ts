import { adminAuth, adminDb, verifyAdminRequest } from '../_firebaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callingAdmin = await verifyAdminRequest(req);
  if (!callingAdmin) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required.' });
  }

  if (callingAdmin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only superadmins can delete admin accounts.' });
  }

  const { uid } = req.body || {};
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing admin UID.' });
  }

  if (uid === callingAdmin.uid) {
    return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  }

  try {
    const targetDoc = await adminDb.collection('admins').doc(uid).get();
    if (!targetDoc.exists) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const targetData = targetDoc.data();
    if (targetData?.role === 'superadmin') {
      const superadminsSnap = await adminDb
        .collection('admins')
        .where('role', '==', 'superadmin')
        .where('status', '==', 'active')
        .get();

      const remainingSuperadmins = superadminsSnap.docs.filter((doc: any) => doc.id !== uid);
      if (remainingSuperadmins.length === 0) {
        return res.status(400).json({ error: 'Cannot delete the last remaining superadmin.' });
      }
    }

    await adminDb.collection('admins').doc(uid).delete();

    try {
      await adminAuth.deleteUser(uid);
    } catch (authErr) {
      console.warn('Firebase Auth user deletion notice:', authErr);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete admin doc:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete administrator account.' });
  }
}
