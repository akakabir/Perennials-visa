import { checkAndUpdateTemplates } from "./updateTemplates";
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './store/AppContext';
import { Cursor } from './components/Cursor';
import { Chatbot } from './components/Chatbot';
import { FloatingContact } from './components/FloatingContact';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// [SEO & METADATA] Synchronizes React router state/settings with document metadata
// [UI COMPONENT] AppSEOUpdater - Renders the AppSEOUpdater view
function AppSEOUpdater() {
  const { siteSettings } = useAppContext();
  
  React.useEffect(() => {
    checkAndUpdateTemplates().catch(console.error);
  }, []);

  React.useEffect(() => {
    if (siteSettings) {
      document.title = siteSettings.siteName || 'Perennials Visa';
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', siteSettings.aboutBlurb || 'Expert visa consultancy');
      }
    }
  }, [siteSettings]);
  
  return null;
}

const Home = lazy(() => import('./pages/Home'));
const Status = lazy(() => import('./pages/Status'));
const Payment = lazy(() => import('./pages/Payment'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PlansManager = lazy(() => import('./pages/admin/PlansManager'));
const PricingManager = lazy(() => import('./pages/admin/PricingManager'));
const ApplicationsManager = lazy(() => import('./pages/admin/ApplicationsManager'));
const ApplicationHistory = lazy(() => import('./pages/admin/ApplicationHistory'));
const ReviewsManager = lazy(() => import('./pages/admin/ReviewsManager'));
const ProcessStepsManager = lazy(() => import('./pages/admin/ProcessStepsManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const EmailCenter = lazy(() => import('./pages/admin/EmailCenter'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

// [MAIN ROUTER COMPONENT] Wraps application in Context and handles all Route definitions
// [UI COMPONENT] App - Renders the App view
export default function App() {
  return (
    <AppProvider>
      <AppSEOUpdater />
      <BrowserRouter>
        <Cursor />
        <Chatbot />
        <FloatingContact />
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2B87C] border-t-transparent"></div></div>}>
          <Routes>

            <Route path="/" element={<><Navbar /><main className="min-h-screen pt-24"><Home /></main><Footer /></>} />
            <Route path="/status" element={<Status />} />
            <Route path="/pay" element={<Payment />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/adminanalytics" element={<Navigate to="/admin/analytics" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="plans" element={<PlansManager />} />
              <Route path="pricing" element={<PricingManager />} />
              <Route path="applications" element={<ApplicationsManager />} />
              <Route path="application-history" element={<ApplicationHistory />} />
              <Route path="reviews" element={<ReviewsManager />} />
              <Route path="process-steps" element={<ProcessStepsManager />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="emails" element={<EmailCenter />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}
