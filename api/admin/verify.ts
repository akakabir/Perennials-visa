import { verifyAdminRequest } from '../_firebaseAdmin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await verifyAdminRequest(req);
  if (!admin) {
    return res.status(403).json({ error: 'Access denied: Admin credentials invalid or inactive.' });
  }

  return res.status(200).json({
    admin: {
      uid: admin.uid,
      email: admin.email,
      role: admin.role,
      status: 'active'
    }
  });
}
