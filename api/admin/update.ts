import { adminAuth, adminDb, verifyAdminRequest } from '../_firebaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callingAdmin = await verifyAdminRequest(req);
  if (!callingAdmin) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required.' });
  }

  const { uid, name, status, role } = req.body || {};
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing admin UID.' });
  }

  try {
    const targetDoc = await adminDb.collection('admins').doc(uid).get();
    if (!targetDoc.exists) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const currentData = targetDoc.data() || {};
    const updates: Record<string, any> = {};

    if (name !== undefined) {
      const cleanName = String(name).trim();
      updates.name = cleanName;
      try {
        await adminAuth.updateUser(uid, { displayName: cleanName });
      } catch (authErr) {
        console.warn('Could not update Auth displayName:', authErr);
      }
    }

    if (role !== undefined) {
      if (callingAdmin.role !== 'superadmin') {
        return res.status(403).json({ error: 'Only superadmins can change admin roles.' });
      }

      if (!['admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Allowed roles are 'admin' and 'superadmin'." });
      }

      if (currentData.role === 'superadmin' && role !== 'superadmin' && currentData.status === 'active') {
        const superadminsSnap = await adminDb
          .collection('admins')
          .where('role', '==', 'superadmin')
          .where('status', '==', 'active')
          .get();

        const remaining = superadminsSnap.docs.filter((doc: any) => doc.id !== uid);
        if (remaining.length === 0) {
          return res.status(400).json({ error: 'Cannot demote the last remaining superadmin.' });
        }
      }

      updates.role = role;
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Allowed values are 'active' or 'inactive'." });
      }

      if (status === 'inactive') {
        if (uid === callingAdmin.uid) {
          return res.status(400).json({ error: 'You cannot deactivate your own account.' });
        }

        if (currentData.role === 'superadmin') {
          const superadminsSnap = await adminDb
            .collection('admins')
            .where('role', '==', 'superadmin')
            .where('status', '==', 'active')
            .get();

          const remaining = superadminsSnap.docs.filter((doc: any) => doc.id !== uid);
          if (remaining.length === 0) {
            return res.status(400).json({ error: 'Cannot deactivate the last remaining superadmin.' });
          }
        }
      }

      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update.' });
    }

    updates.updatedAt = new Date().toISOString();
    updates.updatedBy = callingAdmin.email;

    await adminDb.collection('admins').doc(uid).update(updates);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Failed to update admin doc:', err);
    return res.status(500).json({ error: err.message || 'Failed to update administrator account.' });
  }
}
