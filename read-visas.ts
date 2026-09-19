import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(collection(db, 'visaPlans'));
  snapshot.docs.forEach(doc => {
    console.log(`ID: ${doc.id}`);
    console.log(`Name: ${doc.data().name}`);
    console.log(`Description: ${doc.data().description}`);
    console.log(`Current Requirements: ${JSON.stringify(doc.data().requirements)}`);
    console.log('---');
  });
  process.exit(0);
}
run();
