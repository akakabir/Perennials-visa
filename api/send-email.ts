import { Resend } from 'resend';
import { adminDb, verifyAdminRequest } from './_firebaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authorization: Requires valid Firebase ID token and an admin UID
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required.' });
  }

  const admin = await verifyAdminRequest(req);
  if (!admin) {
    return res.status(403).json({ error: 'Access denied: Admin permissions required.' });
  }

  // 2. Validate payload
  const { to, subject, html, templateName } = req.body || {};

  if (!to || typeof to !== 'string' || to.length > 256 || !to.includes('@')) {
    return res.status(400).json({ error: 'Invalid recipient email address.' });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 256) {
    return res.status(400).json({ error: 'Invalid subject line (max 256 characters).' });
  }

  if (!html || typeof html !== 'string' || html.trim().length === 0 || html.length > 100000) {
    return res.status(400).json({ error: 'Invalid email body content.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Perennials Visa <onboarding@resend.dev>';

  let emailStatus: 'Sent' | 'Failed' = 'Sent';
  let errorMsg: string | undefined;

  try {
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured on the server.');
    }

    const resend = new Resend(resendApiKey);
    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [to.trim()],
      subject: subject.trim(),
      html: html.trim()
    });

    if (sendResult.error) {
      emailStatus = 'Failed';
      errorMsg = sendResult.error.message;
    }
  } catch (err: any) {
    emailStatus = 'Failed';
    errorMsg = err.message || 'Failed to dispatch email via provider.';
  }

  // 3. Write record to emailHistory collection
  try {
    const historyRef = adminDb.collection('emailHistory').doc();
    const record = {
      id: historyRef.id,
      recipient: to.trim(),
      subject: subject.trim(),
      templateName: templateName || 'Custom Message',
      date: new Date().toISOString(),
      status: emailStatus,
      sentBy: admin.email,
      ...(errorMsg ? { errorMsg } : {})
    };
    await historyRef.set(record);

    if (emailStatus === 'Failed') {
      return res.status(500).json({
        error: errorMsg || 'Email delivery failed.',
        recordId: historyRef.id
      });
    }

    return res.status(200).json({
      success: true,
      recordId: historyRef.id
    });
  } catch (dbErr: any) {
    console.error('Failed to log email history:', dbErr);
    if (emailStatus === 'Failed') {
      return res.status(500).json({ error: errorMsg });
    }
    return res.status(200).json({ success: true });
  }
}
