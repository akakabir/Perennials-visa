import { adminAuth, adminDb, verifyAdminRequest } from '../_firebaseAdmin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callingAdmin = await verifyAdminRequest(req);
  if (!callingAdmin) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required.' });
  }

  if (callingAdmin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only superadmins can create admin accounts.' });
  }

  const { email, name, role } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const assignedRole = role || 'admin';
  if (!['admin', 'superadmin'].includes(assignedRole)) {
    return res.status(400).json({ error: "Invalid role. Allowed roles are 'admin' and 'superadmin'." });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    let user;
    try {
      user = await adminAuth.getUserByEmail(cleanEmail);
    } catch {
      user = await adminAuth.createUser({
        email: cleanEmail,
        displayName: name ? String(name).trim() : undefined,
        emailVerified: true
      });
    }

    await adminDb.collection('admins').doc(user.uid).set({
      uid: user.uid,
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      name: name ? String(name).trim() : '',
      role: assignedRole,
      status: 'active',
      createdAt: new Date().toISOString(),
      invitedBy: callingAdmin.email
    });

    return res.status(200).json({
      success: true,
      uid: user.uid,
      email: cleanEmail
    });
  } catch (err: any) {
    console.error('Failed to create admin:', err);
    return res.status(500).json({ error: err.message || 'Failed to create admin account.' });
  }
}
