import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || 'perennials-visa-288d6';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.trim();
  // Whole service-account JSON pasted by mistake: pull the key out of it
  if (privateKey.startsWith('{')) {
    try { privateKey = JSON.parse(privateKey).private_key || privateKey; } catch { /* ignore */ }
  }
  privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();
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
    const adminDoc = await adminDb.collection('admins').doc(decoded.uid).get();

    if (!adminDoc.exists) {
      return null;
    }

    const data = adminDoc.data();
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