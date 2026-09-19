export type VisaPlan = {
  id: string;
  name: string;
  destinationCountry: string;
  flag: string;
  description: string;
  requirements: string[];
  processingTime: string;
  featured: boolean;
  status: 'active' | 'archived';
  prices: Price[];
};

export type Price = {
  country: string;
  currencyCode: string;
  currencySymbol: string;
  amount: number;
  note: string;
};

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Assessment' | 'Payment Required' | 'Payment Confirmed' | 'Documents Requested' | 'Processing' | 'Approved' | 'Rejected';

export type Application = {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  submittedDate: string;
  status: ApplicationStatus;
  adminNote?: string;
  archived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
};

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  country?: string;
  status: ReviewStatus;
  date: string;
};

export type AdminAccount = {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  status: 'active' | 'inactive';
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  time: string;
  order: number;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export type EmailDraft = {
  id: string;
  recipients: string;
  subject: string;
  body: string;
  templateId?: string;
};

export type EmailRecord = {
  id: string;
  recipient: string;
  subject: string;
  templateName?: string;
  date: string;
  status: 'Sent' | 'Failed';
  errorMsg?: string;
};

export type SiteSettings = {
  siteName: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  address: string;
  heroHeadline: string;
  heroSubheading: string;
  aboutBlurb: string;
  footerText: string;
  admins: AdminAccount[];
  forgotPasswordCode?: string;
  defaultFromEmail?: string;
  admin1Password?: string;
};
