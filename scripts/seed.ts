import 'dotenv/config';
import { adminDb } from '../api/_firebaseAdmin';

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

async function seed() {
  const batch = adminDb.batch();

  initialPlans.forEach(plan => {
    batch.set(adminDb.collection('visaPlans').doc(plan.id), plan);
  });

  batch.set(adminDb.collection('siteSettings').doc('global'), initialSettings, { merge: true });

  await batch.commit();
  console.log('Seed completed successfully (plans and site settings only).');
}

seed().catch(console.error);
