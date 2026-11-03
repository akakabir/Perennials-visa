import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || 'perennials-visa-288d6';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  let keyStr = privateKey.trim();
  // Whole service-account JSON pasted by mistake: pull the key out of it
  if (keyStr.startsWith('{')) {
    try {
      const parsed = JSON.parse(keyStr);
      if (typeof parsed?.private_key === 'string') {
        keyStr = parsed.private_key;
      }
    } catch { /* ignore */ }
  }
  privateKey = keyStr.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();
}

/** True only when real service-account credentials loaded. Firestore/Auth admin calls need this. */
export let adminReady = false;

let app: App;
if (!getApps().length) {
  try {
    if (!clientEmail || !privateKey) throw new Error('FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set');
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId
    });
    adminReady = true;
  } catch (err) {
    // A bad key must never crash the API routes (chat, health)
    console.error('Firebase admin credentials not usable, check FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL:', (err as Error).message);
    app = initializeApp({ projectId }, 'fallback');
  }
} else {
  app = getApp();
  adminReady = true;
}

export const adminAuth: Auth = getAuth(app);
const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
export const adminDb: Firestore = databaseId === '(default)'
  ? getFirestore(app)
  : getFirestore(app, databaseId);

export interface VerifiedAdmin {
  uid: string;
  email: string;
  role: string;
}

export async function verifyAdminRequest(req: any): Promise<VerifiedAdmin | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  if (!adminReady) return null;

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    let adminDoc = await adminDb.collection('admins').doc(decoded.uid).get();
    let data = adminDoc.exists ? adminDoc.data() : null;

    // Check by email or phone if not found by direct UID (e.g. Google OAuth or Phone OTP sign-in)
    if (!data && decoded.email) {
      const byEmail = await adminDb.collection('admins')
        .where('email', '==', decoded.email.toLowerCase().trim())
        .limit(1)
        .get();
      if (!byEmail.empty) {
        data = byEmail.docs[0].data();
        if (data && data.status !== 'inactive') {
          await adminDb.collection('admins').doc(decoded.uid).set({
            ...data,
            uid: decoded.uid,
            linkedAt: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        }
      }
    }

    if (!data && decoded.phone_number) {
      const byPhone = await adminDb.collection('admins')
        .where('phone', '==', decoded.phone_number)
        .limit(1)
        .get();
      if (!byPhone.empty) {
        data = byPhone.docs[0].data();
        if (data && data.status !== 'inactive') {
          await adminDb.collection('admins').doc(decoded.uid).set({
            ...data,
            uid: decoded.uid,
            linkedAt: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        }
      }
    }

    if (!data || data.status === 'inactive') {
      return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email || data.email,
      role: data.role || 'admin'
    };
  } catch (err) {
    console.warn('verifyAdminRequest failure:', err);
    return null;
  }
}

export default app;