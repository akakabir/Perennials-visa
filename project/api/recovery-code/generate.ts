import crypto from 'crypto';
import { adminDb, verifyAdminRequest } from '../_firebaseAdmin';

export function hashRecoveryCode(code: string, salt: string): string {
  const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return crypto.scryptSync(normalized, salt, 64).toString('hex');
}

export function generateRandomCode(): string {
  // 24 characters: 4 groups of 6 uppercase letters/digits
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without ambiguous 0/O, 1/I
  let result = '';
  const randomBytes = crypto.randomBytes(24);
  for (let i = 0; i < 24; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  // Format as 4 groups of 6: XXXXXX-XXXXXX-XXXXXX-XXXXXX
  return `${result.slice(0, 6)}-${result.slice(6, 12)}-${result.slice(12, 18)}-${result.slice(18, 24)}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authorization: Requires valid Firebase ID token and an admin UID
  const admin = await verifyAdminRequest(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized: Admin credentials required.' });
  }

  try {
    const plainCode = generateRandomCode();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashRecoveryCode(plainCode, salt);

    // Storing ONLY salted hash in adminRecovery/{uid}.
    // Overwriting doc invalidates any prior code.
    await adminDb.collection('adminRecovery').doc(admin.uid).set({
      uid: admin.uid,
      email: admin.email,
      hash,
      salt,
      createdAt: new Date().toISOString(),
      used: false
    });

    // Write audit record
    await adminDb.collection('auditLogs').add({
      type: 'RECOVERY_CODE_GENERATED',
      uid: admin.uid,
      email: admin.email,
      timestamp: new Date().toISOString()
    });

    // Return the plain code ONCE
    return res.status(200).json({
      success: true,
      code: plainCode
    });
  } catch (err: any) {
    console.error('Failed to generate recovery code:', err);
    return res.status(500).json({ error: 'Failed to generate recovery code.' });
  }
}
