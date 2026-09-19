import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { VisaPlan, Application, Review, SiteSettings, ProcessStep, EmailTemplate, EmailDraft, EmailRecord } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  visaPlans: VisaPlan[];
  applications: Application[];
  reviews: Review[];
  siteSettings: SiteSettings;
  processSteps: ProcessStep[];
  emailTemplates: EmailTemplate[];
  emailDrafts: EmailDraft[];
  emailHistory: EmailRecord[];
  updateEmailTemplate: (template: EmailTemplate) => Promise<void>;
  addEmailTemplate: (template: EmailTemplate) => Promise<void>;
  deleteEmailTemplate: (id: string) => Promise<void>;
  updateEmailDraft: (draft: EmailDraft) => Promise<void>;
  addEmailDraft: (draft: EmailDraft) => Promise<void>;
  deleteEmailDraft: (id: string) => Promise<void>;
  addEmailRecord: (record: EmailRecord) => Promise<void>;
  deleteEmailRecord: (id: string) => Promise<void>;
  adminLoggedIn: boolean; adminEmail: string | null; adminUsername?: string | null; setAdminUsername: (username: string | null) => void;
  setAdminLoggedIn: (status: boolean) => void;
  updateVisaPlan: (plan: VisaPlan) => Promise<void>;
  addVisaPlan: (plan: VisaPlan) => Promise<void>;
  deleteVisaPlan: (id: string) => Promise<void>;
  updateApplication: (application: Application) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  addApplication: (application: Application) => Promise<void>;
  updateReview: (review: Review) => Promise<void>;
  addReview: (review: Review) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;
  updateProcessStep: (step: ProcessStep) => Promise<void>;
  addProcessStep: (step: ProcessStep) => Promise<void>;
  deleteProcessStep: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PLANS: VisaPlan[] = [
  { id: 'schengen', name: 'Schengen', description: 'Access 27 European countries with a single visa. Ideal for tourism and short-stay business.', featured: true, destinationCountry: '', flag: '', processingTime: '', status: 'active', prices: [{ currencyCode: 'AED', amount: 500, currencySymbol: 'AED', country: '', note: '' }], requirements: ['Passport', 'Photos', 'Bank Statement'] },
  { id: 'japan', name: 'Japan', description: 'Experience the culture and beauty of Japan. We handle all documentation for your tourist visa.', featured: true, destinationCountry: '', flag: '', processingTime: '', status: 'active', prices: [{ currencyCode: 'AED', amount: 450, currencySymbol: 'AED', country: '', note: '' }], requirements: ['Passport', 'Photos', 'Flight Details'] },
  { id: 'uk', name: 'UK', description: 'Visit the United Kingdom for tourism or short business trips with our expert guidance.', featured: true, destinationCountry: '', flag: '', processingTime: '', status: 'active', prices: [{ currencyCode: 'AED', amount: 650, currencySymbol: 'AED', country: '', note: '' }], requirements: ['Passport', 'Financials', 'Accommodation'] },
  { id: 'us', name: 'US', description: 'B1/B2 Visitor visa assistance for the United States, including DS-160 filling and interview prep.', featured: true, destinationCountry: '', flag: '', processingTime: '', status: 'active', prices: [{ currencyCode: 'AED', amount: 800, currencySymbol: 'AED', country: '', note: '' }], requirements: ['Passport', 'Photo', 'DS-160'] },
  { id: 'canada', name: 'Canada', description: 'Canadian Visitor Visa (Temporary Resident Visa) application support for seamless travel.', featured: true, destinationCountry: '', flag: '', processingTime: '', status: 'active', prices: [{ currencyCode: 'AED', amount: 600, currencySymbol: 'AED', country: '', note: '' }], requirements: ['Passport', 'Financials', 'Travel History'] },
  { id: 'australia', name: 'Australia', description: 'Visit Australia for holidays or business. We assist with Subclass 600 applications.', featured: true, destinationCountry: '', flag: '', processingTime: '', status: 'active', prices: [{ currencyCode: 'AED', amount: 550, currencySymbol: 'AED', country: '', note: '' }], requirements: ['Passport', 'Bank Statement', 'Employment Letter'] },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Perennials Visa',
  logoUrl: '/logo.png',
  phone: '+971 50 123 4567',
  whatsapp: '971501234567',
  instagram: 'perennials.visa',
  email: 'info@perennialsvisa.com',
  address: 'Dubai, UAE',
  heroHeadline: 'Your Gateway to Global Horizons',
  heroSubheading: 'Expert visa consultancy for individuals and businesses worldwide.',
  aboutBlurb: 'We provide seamless visa processing with a high success rate.',
  footerText: '© 2026 Perennials Visa. All rights reserved.',
  admins: [{ name: 'Admin', email: 'admin1', passwordHash: 'Perennial1@', role: 'admin', status: 'active' }],
  forgotPasswordCode: 'didyouknowthatthiswebsitewasmadebyathirteenyearold'
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  { id: 't1', name: 'Assessment - Not Recommended to Proceed', subject: 'Visa Assessment Update - {{referenceId}}', body: 'Hello {{applicantName}},\n\nThank you for allowing Perennials to review your visa profile.\n\nBased on the information currently available, we are unable to recommend proceeding with the visa application at this stage.\n\nThis assessment is based on the information provided and does not represent a decision by the relevant immigration authority.\n\nIf your circumstances change or additional supporting documents become available, we can review your profile again.\n\nRegards,\nPerennials\n\n{{companyEmail}}\n{{companyPhone}}' },
  { id: 't2', name: 'Assessment - You Can Proceed', subject: 'Visa Assessment - Next Steps', body: 'Hello {{applicantName}},\n\nThank you for choosing Perennials.\n\nBased on the information currently available, your profile can proceed to the next stage of the visa application process.\n\nPlease note that this assessment does not guarantee visa approval. The final decision is made by the relevant immigration authority.\n\nTo continue with the process, the required service payment must be completed.\n\nOnce payment is confirmed, we can proceed with the next steps and required documentation.\n\nApplication Reference:\n{{referenceId}}\n\nDestination:\n{{destination}}\n\nRegards,\nPerennials\n\n{{companyEmail}}\n{{companyPhone}}' }
];

const DEFAULT_STEPS: ProcessStep[] = [
  { id: '1', title: "Choose Plan", description: "Select your destination and visa type.", time: "1-2 Days", order: 1 },
  { id: '2', title: "Submit Docs", description: "Upload requirements securely online.", time: "1 Day", order: 2 },
  { id: '3', title: "We Process", description: "Our experts review and file your case.", time: "3-5 Days", order: 3 }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [visaPlans, setVisaPlans] = useState<VisaPlan[]>(DEFAULT_PLANS);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_STEPS);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([]);
  const [adminEmail, setAdminUsernameState] = useState<string | null>(() => sessionStorage.getItem('pv_adminEmail'));
  const [adminLoggedIn, setAdminLoggedInState] = useState<boolean>(() => {
    return sessionStorage.getItem('pv_adminSession') === 'true';
  });

  const setAdminUsername = (username: string | null) => { setAdminUsernameState(username); if(username) sessionStorage.setItem('pv_adminEmail', username); else sessionStorage.removeItem('pv_adminEmail'); };
  const setAdminLoggedIn = (status: boolean) => {
    setAdminLoggedInState(status);
    if (status) {
      sessionStorage.setItem('pv_adminSession', 'true');
    } else {
      sessionStorage.removeItem('pv_adminSession');
    }
  };

  useEffect(() => {
    const unsubscribePlans = onSnapshot(
      collection(db, 'visaPlans'),
      (snapshot) => {
        if (snapshot.empty) {
          DEFAULT_PLANS.forEach(plan => setDoc(doc(db, 'visaPlans', plan.id), plan).catch(() => {}));
          setVisaPlans(DEFAULT_PLANS);
        } else {
          setVisaPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VisaPlan)));
        }
      },
      (err) => {
        console.warn('Firestore visaPlans listener notice:', err.message);
      }
    );

    const unsubscribeApps = onSnapshot(
      collection(db, 'applications'),
      (snapshot) => {
        setApplications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
      },
      (err) => {
        console.warn('Firestore applications listener notice:', err.message);
      }
    );

    const unsubscribeReviews = onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      },
      (err) => {
        console.warn('Firestore reviews listener notice:', err.message);
      }
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, 'siteSettings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSiteSettings({ id: docSnap.id, ...docSnap.data() } as unknown as SiteSettings);
        } else {
          setDoc(doc(db, 'siteSettings', 'global'), DEFAULT_SETTINGS).catch(() => {});
          setSiteSettings(DEFAULT_SETTINGS);
        }
      },
      (err) => {
        console.warn('Firestore siteSettings listener notice:', err.message);
      }
    );

    const unsubscribeEmailTemplates = onSnapshot(
      collection(db, 'emailTemplates'),
      (snapshot) => {
        if (snapshot.empty) {
          DEFAULT_TEMPLATES.forEach(template => setDoc(doc(db, 'emailTemplates', template.id), template).catch(() => {}));
          setEmailTemplates(DEFAULT_TEMPLATES);
        } else {
          setEmailTemplates(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmailTemplate)));
        }
      },
      (err) => {
        console.warn('Firestore emailTemplates listener notice:', err.message);
      }
    );

    const unsubscribeEmailDrafts = onSnapshot(
      collection(db, 'emailDrafts'),
      (snapshot) => {
        setEmailDrafts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmailDraft)));
      },
      (err) => {
        console.warn('Firestore emailDrafts listener notice:', err.message);
      }
    );

    const unsubscribeEmailHistory = onSnapshot(
      collection(db, 'emailHistory'),
      (snapshot) => {
        const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmailRecord));
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEmailHistory(records);
      },
      (err) => {
        console.warn('Firestore emailHistory listener notice:', err.message);
      }
    );

    const unsubscribeSteps = onSnapshot(
      collection(db, 'processSteps'),
      (snapshot) => {
        if (snapshot.empty) {
          DEFAULT_STEPS.forEach(step => setDoc(doc(db, 'processSteps', step.id), step).catch(() => {}));
          setProcessSteps(DEFAULT_STEPS);
        } else {
          const steps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProcessStep));
          steps.sort((a, b) => a.order - b.order);
          setProcessSteps(steps);
        }
      },
      (err) => {
        console.warn('Firestore processSteps listener notice:', err.message);
      }
    );

    return () => {
      unsubscribePlans();
      unsubscribeApps();
      unsubscribeReviews();
      unsubscribeSettings();
      unsubscribeSteps();
      unsubscribeEmailTemplates();
      unsubscribeEmailDrafts();
      unsubscribeEmailHistory();
    };
  }, []);

  const updateVisaPlan = async (plan: VisaPlan) => {
    await updateDoc(doc(db, 'visaPlans', plan.id), { ...plan });
  };
  // [DB ACTION] Create a new Visa Plan
  const addVisaPlan = async (plan: VisaPlan) => {
    await setDoc(doc(db, 'visaPlans', plan.id), { ...plan });
  };
  const deleteVisaPlan = async (id: string) => {
    await deleteDoc(doc(db, 'visaPlans', id));
  };

  const deleteApplication = async (id: string) => {
    await deleteDoc(doc(db, 'applications', id));
  };
  const updateApplication = async (app: Application) => {
    await updateDoc(doc(db, 'applications', app.id), { ...app });
  };
  const addApplication = async (app: Application) => {
    await setDoc(doc(db, 'applications', app.id), { ...app });
  };

  const updateReview = async (review: Review) => {
    await updateDoc(doc(db, 'reviews', review.id), { ...review });
  };
  const addReview = async (review: Review) => {
    await setDoc(doc(db, 'reviews', review.id), { ...review });
  };
  const deleteReview = async (id: string) => {
    await deleteDoc(doc(db, 'reviews', id));
  };

  // [DB ACTION] Update global website settings
  const updateSiteSettings = async (settings: SiteSettings) => {
    await setDoc(doc(db, 'siteSettings', 'global'), { ...settings });
  };

  const updateProcessStep = async (step: ProcessStep) => {
    await updateDoc(doc(db, 'processSteps', step.id), { ...step });
  };
  const addProcessStep = async (step: ProcessStep) => {
    await setDoc(doc(db, 'processSteps', step.id), { ...step });
  };
  const deleteProcessStep = async (id: string) => {
    await deleteDoc(doc(db, 'processSteps', id));
  };

  const updateEmailTemplate = async (t: EmailTemplate) => await updateDoc(doc(db, 'emailTemplates', t.id), { ...t });
  const addEmailTemplate = async (t: EmailTemplate) => await setDoc(doc(db, 'emailTemplates', t.id), { ...t });
  const deleteEmailTemplate = async (id: string) => await deleteDoc(doc(db, 'emailTemplates', id));
  const updateEmailDraft = async (d: EmailDraft) => await updateDoc(doc(db, 'emailDrafts', d.id), { ...d });
  const addEmailDraft = async (d: EmailDraft) => await setDoc(doc(db, 'emailDrafts', d.id), { ...d });
  const deleteEmailDraft = async (id: string) => await deleteDoc(doc(db, 'emailDrafts', id));
  const addEmailRecord = async (r: EmailRecord) => await setDoc(doc(db, 'emailHistory', r.id), { ...r });
  const deleteEmailRecord = async (id: string) => await deleteDoc(doc(db, 'emailHistory', id));

  const contextValue = React.useMemo(() => {
    if (!siteSettings) return undefined;
    return {
      visaPlans, applications, reviews, siteSettings, processSteps, emailTemplates, emailDrafts, emailHistory, adminLoggedIn, adminEmail, adminUsername: adminEmail, setAdminLoggedIn, setAdminUsername,
      updateVisaPlan, addVisaPlan, deleteVisaPlan,
      updateApplication, addApplication, deleteApplication, updateReview, addReview, deleteReview, updateSiteSettings,
      updateProcessStep, addProcessStep, deleteProcessStep, updateEmailTemplate, addEmailTemplate, deleteEmailTemplate, updateEmailDraft, addEmailDraft, deleteEmailDraft, addEmailRecord, deleteEmailRecord
    };
  }, [visaPlans, applications, reviews, siteSettings, processSteps, adminLoggedIn, emailTemplates, emailDrafts, emailHistory, adminEmail]);

  if (!siteSettings || !contextValue) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E2B87C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

