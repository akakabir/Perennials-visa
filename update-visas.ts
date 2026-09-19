import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const updates = {
  "1": { requirements: ["Valid Passport (6+ months validity)", "Proof of Financial Means", "Comprehensive Health Insurance", "Clean Criminal Record"] },
  "1789012536762": { requirements: ["Valid Passport", "Bank statements (Last 6 months)", "Proof of Employment or Business", "Confirmed Flight Itinerary", "Hotel Reservation Details"] },
  "1789477418320": { requirements: ["Valid Passport", "Bank statements (Last 3 months)", "Proof of Ties to Home Country", "Planned Travel Itinerary"] },
  "1789477750670": { requirements: ["Valid Passport", "DS-160 Confirmation Page", "Visa Appointment Confirmation Letter", "Proof of Funds / Bank Statements"] },
  "2": { requirements: ["Valid Passport", "Bank statements (Last 6 months)", "Proof of Employment or Business", "Accommodation Details / Invitation Letter"] },
  "3": { requirements: ["Valid Passport (min 6 months)", "Round-trip Flight Itinerary", "Confirmed Hotel Booking", "Travel Medical Insurance (Min €30,000 coverage)"] },
  "4": { requirements: ["Letter of Acceptance from DLI", "Proof of Financial Support (1 year tuition + living)", "Valid Passport", "Provincial Attestation Letter (if applicable)"] }
};

async function run() {
  for (const [id, data] of Object.entries(updates)) {
    await updateDoc(doc(db, 'visaPlans', id), data);
    console.log(`Updated plan ${id}`);
  }
  process.exit(0);
}
run();
