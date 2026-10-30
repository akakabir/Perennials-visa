import crypto from 'crypto';
import { adminAuth, adminDb } from '../_firebaseAdmin';
import { checkRateLimit, getClientIp } from '../_rateLimit';
import { hashRecoveryCode } from './generate';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const { email, code, newPassword } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email or recovery code.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Rate limit: 5 attempts per hour per IP and per email
  const ipLimit = await checkRateLimit(`redeem_ip:${clientIp}`, 5, 3600);
  const emailLimit = await checkRateLimit(`redeem_email:${cleanEmail}`, 5, 3600);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return res.status(429).json({
      error: 'Too many recovery attempts. Please try again in an hour.'
    });
  }

  if (!code || typeof code !== 'string' || !newPassword || typeof newPassword !== 'string' || newPassword.length < 10) {
    return res.status(400).json({ error: 'Invalid email or recovery code.' });
  }

  try {
    // 1. Find user in Firebase Auth
    let user;
    try {
      user = await adminAuth.getUserByEmail(cleanEmail);
    } catch {
      // User not found in Firebase Auth: return generic error to avoid email enumeration
      return res.status(400).json({ error: 'Invalid email or recovery code.' });
    }

    // 2. Fetch recovery document for user UID
    const recDoc = await adminDb.collection('adminRecovery').doc(user.uid).get();
    if (!recDoc.exists) {
      return res.status(400).json({ error: 'Invalid email or recovery code.' });
    }

    const recData = recDoc.data()!;
    if (recData.used) {
      return res.status(400).json({ error: 'This recovery code has already been used. Please request assistance.' });
    }

    // 3. Verify code using timing-safe comparison
    const computedHash = hashRecoveryCode(code, recData.salt);
    const expectedHashBuf = Buffer.from(recData.hash, 'hex');
    const actualHashBuf = Buffer.from(computedHash, 'hex');

    if (expectedHashBuf.length !== actualHashBuf.length || !crypto.timingSafeEqual(expectedHashBuf, actualHashBuf)) {
      return res.status(400).json({ error: 'Invalid email or recovery code.' });
    }

    // 4. Update password via firebase-admin updateUser
    await adminAuth.updateUser(user.uid, {
      password: newPassword
    });

    // 5. Mark code as used (single use)
    await adminDb.collection('adminRecovery').doc(user.uid).update({
      used: true,
      usedAt: new Date().toISOString()
    });

    // 6. Write audit log
    await adminDb.collection('auditLogs').add({
      type: 'RECOVERY_CODE_REDEEMED',
      uid: user.uid,
      email: cleanEmail,
      ip: clientIp,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please sign in and generate a fresh recovery code in Settings.'
    });
  } catch (err: any) {
    console.error('Redeem recovery code error:', err);
    return res.status(400).json({ error: 'Invalid email or recovery code.' });
  }
}
