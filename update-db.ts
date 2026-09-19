import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  await setDoc(doc(db, 'siteSettings', 'global'), {
    logoUrl: '/image.png'
  }, { merge: true });
  console.log('done');
  process.exit(0);
}
run();
