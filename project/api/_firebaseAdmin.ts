import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

let app: App;
if (!getApps().length) {
  if (clientEmail && privateKey) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      }),
      projectId
    });
  } else {
    app = initializeApp({
      projectId
    });
  }
} else {
  app = getApp();
}

export const adminAuth: Auth = getAuth(app);
export const adminDb: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

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
