import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { motion } from 'motion/react';

// [UI COMPONENT] Payment - Renders the Payment view
export default function Payment() {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('ref');
  const { applications, visaPlans, updateApplication } = useAppContext();
  
  const [app, setApp] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  
  useEffect(() => {
    if (refId) {
      const found = applications.find(a => a.referenceId === refId);
      if (found) setApp(found);
    }
  }, [refId, applications]);

  const handlePay = () => {
    if (app) {
      updateApplication({ ...app, status: 'Payment Confirmed' });
      setPaid(true);
    }
  };

  const plan = app ? visaPlans.find(p => p.id === app.planId) : null;

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans flex flex-col relative z-10">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-[#E6DFD5] rounded-3xl p-8 shadow-xl"
        >
          {paid ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#3E3A35]">Payment Confirmed</h2>
              <p className="text-[#7A7369]">Thank you! Your payment for application {app?.referenceId} has been received.</p>
            </div>
          ) : app ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#3E3A35]">Complete Payment</h2>
                <p className="text-[#7A7369] mt-2">Application Reference: <span className="font-mono text-[#E2B87C]">{app.referenceId}</span></p>
              </div>
              
              <div className="bg-[#F7F5F0] rounded-xl p-4 space-y-2 text-sm text-[#5C564D] border border-[#E6DFD5]">
                <div className="flex justify-between">
                  <span className="text-[#7A7369]">Applicant</span>
                  <span className="font-medium">{app.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7369]">Visa Plan</span>
                  <span className="font-medium">{plan?.name || 'Unknown Plan'}</span>
                </div>
                <div className="flex justify-between border-t border-[#E6DFD5] pt-2 mt-2">
                  <span className="font-medium text-[#3E3A35]">Total Due</span>
                  <span className="font-bold text-lg text-[#3E3A35]">$150.00</span>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handlePay} className="w-full justify-center gap-2 py-4 text-base">
                  <CreditCard className="w-5 h-5" />
                  Pay Securely
                </Button>
                <p className="text-center text-xs text-[#7A7369] mt-4 flex items-center justify-center gap-1">
                  Secured with 256-bit encryption.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#3E3A35]">Invalid Reference</h2>
              <p className="text-[#7A7369] mt-2">Please check your link and try again.</p>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
