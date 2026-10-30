import { adminAuth, adminDb } from '../api/_firebaseAdmin';

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  const role = process.argv[4] || process.env.ADMIN_ROLE || 'superadmin';

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password> [role]');
    console.error('Or set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ROLE environment variables.');
    process.exit(1);
  }

  if (password.length < 10) {
    console.error('Error: Password must be at least 10 characters long.');
    process.exit(1);
  }

  try {
    let uid: string;
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      uid = existingUser.uid;
      await adminAuth.updateUser(uid, { password });
      console.log(`Updated password for existing Firebase Auth user: ${email} (${uid})`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        const newUser = await adminAuth.createUser({
          email,
          password,
          emailVerified: true
        });
        uid = newUser.uid;
        console.log(`Created new Firebase Auth user: ${email} (${uid})`);
      } else {
        throw err;
      }
    }

    // Provision admin document in Firestore admins collection
    await adminDb.collection('admins').doc(uid).set({
      uid,
      email,
      role,
      status: 'active',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`Successfully configured admin document in 'admins/${uid}' with role '${role}'.`);
    process.exit(0);
  } catch (error: any) {
    console.error('Failed to create or configure admin:', error.message || error);
    process.exit(1);
  }
}

main();
