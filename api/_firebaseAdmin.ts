import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || 'perennials-visa-288d6';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

let app: App;
if (!getApps().length) {
  try {
    if (clientEmail && privateKey) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId
      });
    } else {
      app = initializeApp({ projectId });
    }
  } catch (err) {
    // Bad FIREBASE_PRIVATE_KEY must not crash every API route (chat, health)
    console.error('Firebase admin init with credentials failed, check FIREBASE_PRIVATE_KEY:', err);
    app = initializeApp({ projectId }, 'fallback');
  }
} else {
  app = getApp();
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
