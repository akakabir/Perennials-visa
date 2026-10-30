import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import config from './firebase-applet-config.json' assert { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);
const auth = getAuth(app);

const initialPlans = [
  {
    id: '1',
    name: 'UAE Golden Visa',
    destinationCountry: 'United Arab Emirates',
    flag: '🇦🇪',
    description: 'Long-term residency for investors, entrepreneurs, and specialized talents.',
    requirements: ['Proof of investment or specialized talent', 'Valid passport', 'Health insurance'],
    processingTime: '2-4 Weeks',
    featured: true,
    status: 'active',
    prices: [
      { country: 'Global', currencyCode: 'USD', currencySymbol: '$', amount: 2500, note: 'Excludes applicable local taxes/GST/VAT' },
      { country: 'UAE', currencyCode: 'AED', currencySymbol: 'AED', amount: 9180, note: 'Excludes applicable local taxes/GST/VAT' }
    ]
  },
  {
    id: '2',
    name: 'UK Visit Visa',
    destinationCountry: 'United Kingdom',
    flag: '🇬🇧',
    description: 'Standard visitor visa for tourism, business, or visiting family.',
    requirements: ['Valid passport', 'Bank statements (6 months)', 'Proof of employment/business'],
    processingTime: '3-4 Weeks',
    featured: true,
    status: 'active',
    prices: [
      { country: 'Global', currencyCode: 'USD', currencySymbol: '$', amount: 350, note: 'Excludes applicable local taxes/GST/VAT' },
      { country: 'India', currencyCode: 'INR', currencySymbol: '₹', amount: 29000, note: 'Excludes applicable local taxes/GST/VAT' }
    ]
  },
  {
    id: '3',
    name: 'Schengen Visa',
    destinationCountry: 'Europe',
    flag: '🇪🇺',
    description: 'Travel freely across 27 European countries for tourism or business.',
    requirements: ['Valid passport', 'Flight itinerary', 'Hotel booking', 'Travel insurance'],
    processingTime: '15-30 Days',
    featured: true,
    status: 'active',
    prices: [
      { country: 'Global', currencyCode: 'USD', currencySymbol: '$', amount: 200, note: 'Excludes applicable local taxes/GST/VAT' }
    ]
  },
  {
    id: '4',
    name: 'Canada Study Visa',
    destinationCountry: 'Canada',
    flag: '🇨🇦',
    description: 'Study permit for international students enrolled at designated learning institutions.',
    requirements: ['Letter of acceptance', 'Proof of financial support', 'Valid passport'],
    processingTime: '4-8 Weeks',
    featured: false,
    status: 'active',
    prices: [
      { country: 'Global', currencyCode: 'USD', currencySymbol: '$', amount: 450, note: 'Excludes applicable local taxes/GST/VAT' }
    ]
  }
];

const initialApplications = [
  {
    id: 'a1',
    referenceId: 'PV-8492-AX',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 555-0192',
    planId: '1',
    submittedDate: '2026-08-15T10:00:00Z',
    status: 'Processing',
    adminNote: 'Waiting on background check clearance.'
  },
  {
    id: 'a2',
    referenceId: 'PV-3910-B2',
    name: 'Rahul Sharma',
    email: 'r.sharma@example.com',
    phone: '+91 98765 43210',
    planId: '2',
    submittedDate: '2026-09-02T14:30:00Z',
    status: 'Documents Requested',
    adminNote: 'Need updated bank statements.'
  },
  {
    id: 'a3',
    referenceId: 'PV-4412-XZ',
    name: 'Alice Cooper',
    email: 'alice.c@example.com',
    phone: '+1 555-0100',
    planId: '3',
    submittedDate: '2026-09-05T10:00:00Z',
    status: 'Approved',
    adminNote: 'Visa issued and sent via courier.'
  },
  {
    id: 'a4',
    referenceId: 'PV-1102-QQ',
    name: 'Mark Davis',
    email: 'mark.d@example.com',
    phone: '+1 555-0200',
    planId: '4',
    submittedDate: '2026-09-06T10:00:00Z',
    status: 'Submitted',
    adminNote: 'Pending initial review.'
  }
];

const initialReviews = [
  {
    id: 'r1',
    name: 'David L.',
    rating: 5,
    comment: 'The team at Perennials made my UAE Golden Visa process incredibly smooth. Highly professional.',
    country: 'UAE',
    status: 'approved',
    date: '2026-07-20T00:00:00Z'
  },
  {
    id: 'r2',
    name: 'Priya M.',
    rating: 5,
    comment: 'Got my UK Visit Visa without any hassle. Transparent pricing and great support.',
    country: 'UK',
    status: 'approved',
    date: '2026-08-05T00:00:00Z'
  }
];

const initialSettings = {
  id: 'global',
  phone: '+971 4 123 4567',
  whatsapp: '+971 50 123 4567',
  instagram: '@perennialsvisa',
  email: 'contact@perennialsvisa.com',
  address: 'Level 14, Boulevard Plaza, Downtown Dubai, UAE',
  heroHeadline: 'Navigate Your Global Journey with Confidence.',
  heroSubheading: 'Expert visa consultancy for professionals, investors, and travelers seeking seamless global mobility.',
  aboutBlurb: 'Perennials Visa is a premium consultancy dedicated to simplifying complex visa procedures with transparency and expertise.',
  footerText: '© 2026 Perennials Visa. All rights reserved.',
  companyName: 'Perennials Visa',
  logoUrl: '/image.png'
};

async function run() {
  try {

    for (const plan of initialPlans) {
      await setDoc(doc(db, 'visaPlans', plan.id), plan);
    }
    for (const app of initialApplications) {
      await setDoc(doc(db, 'applications', app.id), app);
    }
    for (const rev of initialReviews) {
      await setDoc(doc(db, 'reviews', rev.id), rev);
    }
    await setDoc(doc(db, 'siteSettings', 'global'), initialSettings, { merge: true });
    console.log('Seed done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
