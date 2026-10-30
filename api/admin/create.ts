import { Resend } from 'resend';
import { adminAuth, adminDb, verifyAdminRequest } from '../_firebaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callingAdmin = await verifyAdminRequest(req);
  if (!callingAdmin) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required.' });
  }

  const { email, name, role } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    let user;
    try {
      user = await adminAuth.getUserByEmail(cleanEmail);
    } catch {
      // Create fresh user in Firebase Auth without plaintext password
      user = await adminAuth.createUser({
        email: cleanEmail,
        displayName: name ? String(name).trim() : undefined,
        emailVerified: true
      });
    }

    // Write admin document keyed by uid
    await adminDb.collection('admins').doc(user.uid).set({
      uid: user.uid,
      email: cleanEmail,
      name: name ? String(name).trim() : '',
      role: role || 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      invitedBy: callingAdmin.email
    });

    // Generate password reset / setup link
    let resetLink = '';
    try {
      resetLink = await adminAuth.generatePasswordResetLink(cleanEmail);

      // Attempt to send invite email if Resend is configured
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Perennials Visa <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: 'You have been invited as an Administrator - Perennials Visa',
          html: `
            <div style="font-family: sans-serif; padding: 24px; color: #3E3A35; max-width: 600px;">
              <h2 style="color: #0C0C34;">Administrator Access Granted</h2>
              <p>Hello ${name ? String(name).trim() : ''},</p>
              <p>You have been added as an administrator for the Perennials Visa portal.</p>
              <p>Please click the button below to set your account password and activate your access:</p>
              <p style="margin: 24px 0;">
                <a href="${resetLink}" style="background-color: #E2B87C; color: #0C0C34; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Set Password & Activate Account
                </a>
              </p>
              <p style="font-size: 12px; color: #7A7369;">If you did not expect this invitation, please contact the site administrator.</p>
            </div>
          `
        });
      }
    } catch (inviteErr) {
      console.warn('Invite email notice:', inviteErr);
    }

    return res.status(200).json({
      success: true,
      uid: user.uid,
      resetLink: resetLink || undefined
    });
  } catch (err: any) {
    console.error('Failed to create admin:', err);
    return res.status(500).json({ error: err.message || 'Failed to create admin account.' });
  }
}
