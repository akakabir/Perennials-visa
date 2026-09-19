import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
initializeApp({
  credential: cert(serviceAccount)
});
const auth = getAuth();

async function run() {
  try {
    const user = await auth.createUser({
      email: 'admin1@perennialsvisa.com',
      password: 'Perennial1@',
    });
    console.log('Successfully created new user:', user.uid);
  } catch (e: any) {
    if (e.code === 'auth/email-already-exists') {
      console.log('User already exists.');
      const user = await auth.getUserByEmail('admin1@perennialsvisa.com');
      await auth.updateUser(user.uid, { password: 'Perennial1@' });
      console.log('Updated user password.');
    } else {
      console.error('Error creating user:', e);
    }
  }
}

run().catch(console.error);
