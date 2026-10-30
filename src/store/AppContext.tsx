import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { VisaPlan, Application, Review, SiteSettings, ProcessStep, EmailTemplate, EmailDraft, EmailRecord, AdminAccount } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

interface AppContextType {
  visaPlans: VisaPlan[];
  applications: Application[];
  reviews: Review[];
  siteSettings: SiteSettings;
  processSteps: ProcessStep[];
  emailTemplates: EmailTemplate[];
  emailDrafts: EmailDraft[];
  emailHistory: EmailRecord[];
  admins: AdminAccount[];
  isDataLoaded: boolean;
  authLoading: boolean;
  adminLoggedIn: boolean;
  adminUser: User | null;
  adminEmail: string | null;
  adminUid: string | null;
  adminRole: string | null;
  adminUsername?: string | null;
  setAdminLoggedIn: (status: boolean) => void;
  setAdminUsername: (username: string | null) => void;
  logout: () => Promise<void>;
  updateEmailTemplate: (template: EmailTemplate) => Promise<void>;
  addEmailTemplate: (template: EmailTemplate) => Promise<void>;
  deleteEmailTemplate: (id: string) => Promise<void>;
  updateEmailDraft: (draft: EmailDraft) => Promise<void>;
  addEmailDraft: (draft: EmailDraft) => Promise<void>;
  deleteEmailDraft: (id: string) => Promise<void>;
  addEmailRecord: (record: EmailRecord) => Promise<void>;
  deleteEmailRecord: (id: string) => Promise<void>;
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
  addAdmin: (data: { email: string; name?: string; role: string }) => Promise<void>;
  updateAdmin: (uid: string, data: Partial<AdminAccount>) => Promise<void>;
  deleteAdmin: (uid: string) => Promise<void>;
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
  aboutBlurb: 'Professional assistance for tourism and short-stay business visa applications worldwide.',
  footerText: '© 2026 Perennials Visa. All rights reserved.',
  defaultFromEmail: 'info@perennialsvisa.com'
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  { id: 't1', name: 'Assessment - Not Recommended to Proceed', subject: 'Visa Assessment Update - {{referenceId}}', body: 'Hello {{applicantName}},\n\nThank you for allowing Perennials to review your visa profile.\n\nBased on the information currently available, we are unable to recommend proceeding with the visa application at this stage.\n\nThis assessment is based on the information provided and does not represent a decision by the relevant immigration authority.\n\nIf your circumstances change or additional supporting documents become available, we can review your profile again.\n\nRegards,\nPerennials\n\n{{companyEmail}}\n{{companyPhone}}' },
  { id: 't2', name: 'Assessment - You Can Proceed', subject: 'Visa Assessment - Next Steps', body: 'Hello {{applicantName}},\n\nThank you for choosing Perennials.\n\nBased on the information currently available, your profile can proceed to the next stage of the visa application process.\n\nPlease note that this assessment does not guarantee visa approval. The final decision is made by the relevant immigration authority.\n\nTo continue with the process, our consultant will coordinate with you regarding the requirements and arrangements.\n\nOnce arranged, we will proceed with the next steps and required documentation.\n\nApplication Reference:\n{{referenceId}}\n\nDestination:\n{{destination}}\n\nRegards,\nPerennials\n\n{{companyEmail}}\n{{companyPhone}}' }
];

const DEFAULT_STEPS: ProcessStep[] = [
  { id: '1', title: "MESSAGE US ON WHATSAPP", description: "Share your intended destination, travel dates, and purpose in a quick message.", time: "Step 1", order: 1 },
  { id: '2', title: "RECEIVE REQUIREMENTS", description: "We review your profile and instantly reply with the exact documents required for your application.", time: "Step 2", order: 2 },
  { id: '3', title: "PREPARE YOUR APPLICATION", description: "We assist with organizing, reviewing, and preparing your application forms and supporting documentation.", time: "Step 3", order: 3 },
  { id: '4', title: "SUBMIT & FOLLOW UP", description: "Your application is submitted through the official process, and we guide you on subsequent steps.", time: "Step 4", order: 4 }
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
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Real Firebase Auth state
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminUid, setAdminUid] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const setAdminUsername = (username: string | null) => {
    setAdminEmail(username);
  };

  const setAdminLoggedInStatus = (status: boolean) => {
    if (!status) {
      signOut(auth).catch(console.error);
    }
    setAdminLoggedIn(status);
  };

  const logout = async () => {
    await signOut(auth);
    setAdminUser(null);
    setAdminLoggedIn(false);
    setAdminEmail(null);
    setAdminUid(null);
    setAdminRole(null);
  };

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await fetch('/api/admin/verify', {
            headers: {
              'Authorization': `Bearer ${await user.getIdToken()}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.admin && data.admin.status !== 'inactive') {
              setAdminUser(user);
              setAdminLoggedIn(true);
              setAdminEmail(user.email || data.admin.email || null);
              setAdminUid(user.uid);
              setAdminRole(data.admin.role || 'admin');
              setAuthLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Admin verification check:', err);
        }
        // If not in admins doc or status is inactive, sign out
        await signOut(auth).catch(() => {});
      }
      setAdminUser(null);
      setAdminLoggedIn(false);
      setAdminEmail(null);
      setAdminUid(null);
      setAdminRole(null);
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Public Firestore listeners (visaPlans, processSteps, siteSettings, reviews)
  useEffect(() => {
    let resolved = 0;
    const markResolved = () => {
      resolved++;
      if (resolved >= 2) {
        setIsDataLoaded(true);
      }
    };
    const safetyTimer = setTimeout(() => {
      setIsDataLoaded(true);
    }, 1800);

    const unsubscribePlans = onSnapshot(
      collection(db, 'visaPlans'),
      (snapshot) => {
        markResolved();
        if (snapshot.empty) {
          DEFAULT_PLANS.forEach(plan => setDoc(doc(db, 'visaPlans', plan.id), plan).catch(() => {}));
          setVisaPlans(DEFAULT_PLANS);
        } else {
          setVisaPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VisaPlan)));
        }
      },
      (err) => {
        markResolved();
        console.warn('Firestore visaPlans listener notice:', err.message);
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
        markResolved();
        if (docSnap.exists()) {
          const data = docSnap.data() as unknown as SiteSettings;
          setSiteSettings(prev => ({
            ...prev,
            ...data
          }));
        } else {
          setDoc(doc(db, 'siteSettings', 'global'), DEFAULT_SETTINGS).catch(() => {});
          setSiteSettings(DEFAULT_SETTINGS);
        }
      },
      (err) => {
        markResolved();
        console.warn('Firestore siteSettings listener notice:', err.message);
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
      clearTimeout(safetyTimer);
      unsubscribePlans();
      unsubscribeReviews();
      unsubscribeSettings();
      unsubscribeSteps();
    };
  }, []);

  // 3. Admin-Only Firestore Listeners (applications, admins, emailTemplates, emailDrafts, emailHistory)
  // Strictly subscribe ONLY when an admin is signed in!
  useEffect(() => {
    if (!adminLoggedIn) {
      setApplications([]);
      setAdmins([]);
      setEmailTemplates(DEFAULT_TEMPLATES);
      setEmailDrafts([]);
      setEmailHistory([]);
      return;
    }

    const unsubApps = onSnapshot(
      collection(db, 'applications'),
      (snapshot) => {
        setApplications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
      },
      (err) => {
        console.warn('Firestore applications listener notice:', err.message);
      }
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        setAdmins(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as AdminAccount)));
      },
      (err) => {
        console.warn('Firestore admins listener notice:', err.message);
      }
    );

    const unsubTemplates = onSnapshot(
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

    const unsubDrafts = onSnapshot(
      collection(db, 'emailDrafts'),
      (snapshot) => {
        setEmailDrafts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmailDraft)));
      },
      (err) => {
        console.warn('Firestore emailDrafts listener notice:', err.message);
      }
    );

    const unsubHistory = onSnapshot(
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

    return () => {
      unsubApps();
      unsubAdmins();
      unsubTemplates();
      unsubDrafts();
      unsubHistory();
    };
  }, [adminLoggedIn]);

  const updateVisaPlan = async (plan: VisaPlan) => {
    await updateDoc(doc(db, 'visaPlans', plan.id), { ...plan });
  };
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

  // Update siteSettings/global (public fields only, no credentials or admins array)
  const updateSiteSettings = async (settings: SiteSettings) => {
    const cleanSettings = { ...settings };
    delete (cleanSettings as any).admins;
    delete (cleanSettings as any).admin1Password;
    delete (cleanSettings as any).forgotPasswordCode;
    await setDoc(doc(db, 'siteSettings', 'global'), cleanSettings);
    setSiteSettings(cleanSettings);
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

  // Admin management
  const addAdmin = async (data: { email: string; name?: string; role: string }) => {
    const idToken = await auth.currentUser?.getIdToken();
    const res = await fetch('/api/admin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create admin');
    }
  };

  const updateAdmin = async (uid: string, data: Partial<AdminAccount>) => {
    await updateDoc(doc(db, 'admins', uid), data);
  };

  const deleteAdmin = async (uid: string) => {
    const idToken = await auth.currentUser?.getIdToken();
    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ uid })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete admin');
    }
  };

  const contextValue = React.useMemo(() => {
    if (!siteSettings) return undefined;
    return {
      visaPlans, applications, reviews, siteSettings, processSteps, emailTemplates, emailDrafts, emailHistory, admins,
      isDataLoaded, authLoading, adminLoggedIn, adminUser, adminEmail, adminUid, adminRole, adminUsername: adminEmail,
      setAdminLoggedIn: setAdminLoggedInStatus, setAdminUsername, logout,
      updateVisaPlan, addVisaPlan, deleteVisaPlan,
      updateApplication, addApplication, deleteApplication, updateReview, addReview, deleteReview, updateSiteSettings,
      updateProcessStep, addProcessStep, deleteProcessStep, updateEmailTemplate, addEmailTemplate, deleteEmailTemplate,
      updateEmailDraft, addEmailDraft, deleteEmailDraft, addEmailRecord, deleteEmailRecord,
      addAdmin, updateAdmin, deleteAdmin
    };
  }, [visaPlans, applications, reviews, siteSettings, processSteps, emailTemplates, emailDrafts, emailHistory, admins, isDataLoaded, authLoading, adminLoggedIn, adminUser, adminEmail, adminUid, adminRole]);

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
