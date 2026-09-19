import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, ShieldCheck, Clock, CreditCard, ChevronRight, Star, FileText, CheckCircle, ArrowRight, Plane, MessageCircle, Copy, Check, ExternalLink, Send, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import TiltCard from '../components/TiltCard';
import Stepper, { Step } from '../components/Stepper';
import { useAppContext } from '../store/AppContext';
import { VisaPlan, Price } from '../types';

// [UI COMPONENT] Home - Renders the Home view
export default function Home() {
  const { siteSettings, visaPlans, reviews, processSteps, addReview, addApplication } = useAppContext();

  const featuredPlans = visaPlans.filter(p => p.featured && p.status === 'active');
  const approvedReviews = reviews.filter(r => r.status === 'approved').slice(0, 4);

  const allCurrencies = Array.from(new Set(
    visaPlans.filter(p => p.status === 'active')
      .flatMap(p => p.prices.map(price => price.currencyCode))
  ));

  const [selectedCurrency, setSelectedCurrency] = useState<string>(allCurrencies.includes('AED') ? 'AED' : (allCurrencies[0] || ''));
  const [checkoutPlan, setCheckoutPlan] = useState<VisaPlan | null>(null);
  
  // Modal & WhatsApp Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNotes, setApplicantNotes] = useState('');
  const [modalTab, setModalTab] = useState<'whatsapp' | 'card'>('whatsapp');
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(true);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedMode, setSubmittedMode] = useState<'whatsapp' | 'card'>('whatsapp');
  const [formError, setFormError] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Helper: Generates a comprehensive pre-written WhatsApp message containing all plan details
  const buildWhatsAppMessage = (
    plan: VisaPlan,
    currency: string,
    name: string,
    email: string,
    phone: string,
    notes: string,
    refId: string
  ) => {
    const priceObj = plan.prices.find(p => p.currencyCode === currency);
    const priceFormatted = priceObj
      ? `${priceObj.currencySymbol}${priceObj.amount.toLocaleString()} ${priceObj.currencyCode}${priceObj.note ? ` (${priceObj.note})` : ''}`
      : `Custom Quote (${currency})`;

    const reqsList = plan.requirements && plan.requirements.length > 0
      ? plan.requirements.map(req => `  • ${req}`).join('\n')
      : '  • Valid Passport (min. 6 months validity)\n  • Personal Identity Documents';

    return `*🌟 VISA APPLICATION INQUIRY - ${siteSettings?.siteName || 'PERENNIALS VISA'} 🌟*

Hello Perennials Visa Team,
I would like to apply for the *${plan.name}* and request your expert guidance.

*📋 SELECTED VISA PLAN DETAILS:*
• *Visa Plan:* ${plan.name} ${plan.flag || ''}
• *Destination:* ${plan.destinationCountry}
• *Processing Time:* ${plan.processingTime}
• *Plan Fee:* ${priceFormatted}
• *Key Requirements:*
${reqsList}

*👤 APPLICANT INFORMATION:*
• *Full Name:* ${name.trim() || 'Prospective Applicant'}
• *Email:* ${email.trim() || 'To be provided in chat'}
• *Phone:* ${phone.trim() || 'To be provided in chat'}
• *Application Ref:* ${refId}
${notes.trim() ? `• *Client Note / Questions:* ${notes.trim()}\n` : ''}
Please let me know the document checklist and how we can proceed with this application. Thank you!`;
  };

  const handleSendWhatsApp = async (plan: VisaPlan) => {
    setIsSubmittingApp(true);
    const refId = `APP-${Date.now().toString().slice(-6)}`;
    const message = buildWhatsAppMessage(
      plan,
      selectedCurrency,
      applicantName,
      applicantEmail,
      applicantPhone,
      applicantNotes,
      refId
    );

    try {
      await addApplication({
        id: Date.now().toString(),
        referenceId: refId,
        name: applicantName.trim() || 'WhatsApp Applicant',
        email: applicantEmail.trim() || 'whatsapp-applicant@perennialsvisa.com',
        phone: applicantPhone.trim() || 'WhatsApp Contact',
        planId: plan.id,
        submittedDate: new Date().toISOString(),
        status: 'Submitted',
        adminNote: `WhatsApp Inquiry for ${plan.name} (${selectedCurrency}). Destination: ${plan.destinationCountry}. Client Note: ${applicantNotes.trim() || 'None'}`
      });
    } catch (err) {
      console.error('Error recording application lead:', err);
    } finally {
      setIsSubmittingApp(false);
    }

    const rawPhone = siteSettings?.whatsapp || '971501234567';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setSubmittedMode('whatsapp');
    setSubmittedRef(refId);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCloseModal = () => {
    setCheckoutPlan(null);
    setSubmittedRef(null);
    setSubmittedMode('whatsapp');
    setFormError('');
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
    setApplicantNotes('');
    setModalTab('whatsapp');
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {checkoutPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A31]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#FCFBF8] rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-xl relative max-h-[92vh] overflow-y-auto border border-[#E6DFD5]"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 text-[#7A7369] hover:text-[#3E3A35] transition-colors bg-[#F0EEE9] hover:bg-[#E6DFD5] rounded-full"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              {submittedRef ? (
                <div className="text-center py-6 space-y-4">
                  {submittedMode === 'whatsapp' ? (
                    <>
                      <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#25D366]/30">
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#3E3A35]">WhatsApp Inquiry Launched!</h3>
                      <p className="text-sm text-[#7A7369] max-w-md mx-auto">
                        Your complete visa plan inquiry and details have been formatted and sent to WhatsApp. Our visa consultant will assist you promptly.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#3E3A35]">Application Submitted!</h3>
                      <p className="text-sm text-[#7A7369] max-w-md mx-auto">
                        Thank you for your application. Our dedicated visa specialists have received your submission and will contact you promptly to finalize document verification and processing.
                      </p>
                    </>
                  )}
                  <div className="bg-[#F0EEE9] border border-[#E6DFD5] rounded-2xl p-4 inline-block text-left my-2 w-full max-w-sm">
                    <div className="text-xs text-[#7A7369]">Application Reference:</div>
                    <div className="font-mono text-lg font-bold text-[#3E3A35]">{submittedRef}</div>
                    <div className="text-xs text-[#7A7369]/80 mt-1">Visa Plan: {checkoutPlan.name} {checkoutPlan.flag}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {submittedMode === 'whatsapp' && (
                      <button
                        onClick={() => handleSendWhatsApp(checkoutPlan)}
                        className="flex-1 h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Re-open WhatsApp
                      </button>
                    )}
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 h-11 bg-white border border-[#D9CFBE] text-[#3E3A35] hover:bg-[#F0EEE9] font-medium rounded-xl transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4 pr-8">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl">{checkoutPlan.flag}</span>
                        <h3 className="text-2xl font-bold text-[#3E3A35]">{checkoutPlan.name}</h3>
                      </div>
                      <p className="text-xs text-[#7A7369]">{checkoutPlan.destinationCountry} • Processing: <span className="font-medium text-[#3E3A35]">{checkoutPlan.processingTime}</span></p>
                    </div>
                  </div>

                  {/* Plan Overview & Price Details */}
                  <div className="bg-[#F0EEE9] rounded-2xl p-4 mb-5 border border-[#E6DFD5]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-[#7A7369]/70 font-semibold">Selected Plan Rate</div>
                        <div className="text-xl font-bold text-[#3E3A35]">
                          {checkoutPlan.prices.find(p => p.currencyCode === selectedCurrency)?.currencySymbol || ''}
                          {checkoutPlan.prices.find(p => p.currencyCode === selectedCurrency)?.amount.toLocaleString() || 'Quote on request'}
                          <span className="text-xs font-normal text-[#7A7369] ml-1.5">{selectedCurrency}</span>
                        </div>
                        {checkoutPlan.prices.find(p => p.currencyCode === selectedCurrency)?.note && (
                          <div className="text-[11px] text-[#7A7369]/70 mt-0.5">
                            {checkoutPlan.prices.find(p => p.currencyCode === selectedCurrency)?.note}
                          </div>
                        )}
                      </div>

                      {allCurrencies.length > 1 && (
                        <div className="flex items-center gap-1.5 bg-white border border-[#D9CFBE] rounded-lg px-2.5 py-1 text-xs">
                          <span className="text-[#7A7369] text-[11px]">Currency:</span>
                          <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="bg-transparent font-medium text-[#3E3A35] outline-none cursor-pointer"
                          >
                            {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    {checkoutPlan.requirements && checkoutPlan.requirements.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#E6DFD5]/60">
                        <div className="text-[11px] font-medium text-[#7A7369] mb-1.5">Key Requirements included in inquiry:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {checkoutPlan.requirements.slice(0, 3).map((req, i) => (
                            <span key={i} className="text-[10px] bg-white/80 border border-[#E6DFD5] text-[#5C564D] px-2 py-0.5 rounded-md">
                              ✓ {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Mode Switcher */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0EEE9] rounded-xl mb-5 border border-[#E6DFD5]">
                    <button
                      type="button"
                      onClick={() => setModalTab('whatsapp')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        modalTab === 'whatsapp'
                          ? 'bg-[#25D366] text-white shadow-sm'
                          : 'text-[#7A7369] hover:text-[#3E3A35]'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Inquire via WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('card')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        modalTab === 'card'
                          ? 'bg-[#3E3A35] text-white shadow-sm'
                          : 'text-[#7A7369] hover:text-[#3E3A35]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Online Card Checkout
                    </button>
                  </div>

                  {/* Applicant Info Form Inputs */}
                  {formError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {formError}
                    </div>
                  )}
                  <div className="space-y-3 mb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#7A7369] mb-1">Full Name</label>
                        <input
                          value={applicantName}
                          onChange={(e) => {
                            setApplicantName(e.target.value);
                            if (formError) setFormError('');
                          }}
                          type="text"
                          className="w-full bg-white border border-[#D9CFBE] rounded-xl px-3.5 py-2 text-sm text-[#3E3A35] outline-none focus:border-[#E2B87C] placeholder-[#7A7369]/40"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#7A7369] mb-1">Phone / WhatsApp</label>
                        <input
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          type="tel"
                          className="w-full bg-white border border-[#D9CFBE] rounded-xl px-3.5 py-2 text-sm text-[#3E3A35] outline-none focus:border-[#E2B87C] placeholder-[#7A7369]/40"
                          placeholder="e.g. +971 50 123 4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#7A7369] mb-1">Email Address</label>
                      <input
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        type="email"
                        className="w-full bg-white border border-[#D9CFBE] rounded-xl px-3.5 py-2 text-sm text-[#3E3A35] outline-none focus:border-[#E2B87C] placeholder-[#7A7369]/40"
                        placeholder="e.g. john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#7A7369] mb-1">Special Inquiries / Travel Notes (Optional)</label>
                      <input
                        value={applicantNotes}
                        onChange={(e) => setApplicantNotes(e.target.value)}
                        type="text"
                        className="w-full bg-white border border-[#D9CFBE] rounded-xl px-3.5 py-2 text-sm text-[#3E3A35] outline-none focus:border-[#E2B87C] placeholder-[#7A7369]/40"
                        placeholder="e.g. Expected travel month, family members, or specific questions"
                      />
                    </div>
                  </div>

                  {modalTab === 'whatsapp' ? (
                    <div className="space-y-4">
                      {/* Live Pre-Written Message Card */}
                      <div className="border border-[#25D366]/30 bg-[#25D366]/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                            <span className="text-xs font-semibold text-[#25D366]">Website Pre-Written WhatsApp Message</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
                              className="text-[11px] text-[#7A7369] hover:text-[#3E3A35] underline"
                            >
                              {showWhatsAppPreview ? 'Hide Preview' : 'Show Preview'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(buildWhatsAppMessage(checkoutPlan, selectedCurrency, applicantName, applicantEmail, applicantPhone, applicantNotes, 'APP-PENDING'))}
                              className="text-[11px] text-[#3E3A35] hover:text-[#25D366] flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#D9CFBE] transition-colors"
                              title="Copy message to clipboard"
                            >
                              {copiedMessage ? <Check className="w-3 h-3 text-[#25D366]" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedMessage ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {showWhatsAppPreview && (
                          <div className="bg-white rounded-xl p-3 border border-[#E6DFD5] text-xs font-mono text-[#5C564D] whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed shadow-inner">
                            {buildWhatsAppMessage(
                              checkoutPlan,
                              selectedCurrency,
                              applicantName,
                              applicantEmail,
                              applicantPhone,
                              applicantNotes,
                              'APP-XXXXXX'
                            )}
                          </div>
                        )}

                        <p className="text-[11px] text-[#7A7369] mt-2">
                          Clicking below will launch WhatsApp directly with the pre-written message containing all visa details, fees, requirements, and your contact info.
                        </p>
                      </div>

                      {/* Primary WhatsApp Action Button */}
                      <button
                        type="button"
                        disabled={isSubmittingApp}
                        onClick={() => handleSendWhatsApp(checkoutPlan)}
                        className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                      >
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span>Send Details & Plan on WhatsApp</span>
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            // Quick direct open with plan defaults
                            const msg = buildWhatsAppMessage(checkoutPlan, selectedCurrency, '', '', '', '', 'QUICK-INQUIRY');
                            const cleanPhone = (siteSettings?.whatsapp || '971501234567').replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="text-xs text-[#7A7369] hover:text-[#25D366] transition-colors underline"
                        >
                          Quick Inquire on WhatsApp without filling form →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!applicantName.trim()) {
                        setFormError('Please enter your full name');
                        return;
                      }
                      setFormError('');
                      setIsSubmittingApp(true);
                      const id = Date.now().toString();
                      const refId = `APP-${id.slice(-6)}`;
                      try {
                        await addApplication({
                          id,
                          referenceId: refId,
                          name: applicantName.trim(),
                          email: applicantEmail.trim() || 'not-provided@example.com',
                          phone: applicantPhone.trim() || 'Not provided',
                          planId: checkoutPlan.id,
                          submittedDate: new Date().toISOString(),
                          status: 'Submitted',
                          adminNote: `Online Card Application for ${checkoutPlan.name} (${selectedCurrency}). Notes: ${applicantNotes.trim() || 'None'}`
                        });
                        setSubmittedMode('card');
                        setSubmittedRef(refId);
                      } catch (err) {
                        console.error('Error submitting application:', err);
                        setFormError('Failed to submit application. Please try again or inquire via WhatsApp.');
                      } finally {
                        setIsSubmittingApp(false);
                      }
                    }} className="space-y-4">
                      <div className="p-4 bg-[#F0EEE9] rounded-xl border border-[#E6DFD5] text-xs text-[#7A7369] text-center">
                        Secured with 256-bit encryption. Payment processing provided via Stripe.
                      </div>
                      <Button type="submit" disabled={isSubmittingApp} className="w-full h-12 flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {isSubmittingApp ? 'Submitting Application...' : 'Pay and Submit Application Online'}
                      </Button>
                    </form>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative pt-20 pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[#3E3A35] mb-6">
              {siteSettings.heroHeadline.split(' ').map((word, i) => (
                <span key={i} className={word.toLowerCase() === 'global' ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D]' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-[#7A7369] max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              {siteSettings.heroSubheading}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => {
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Explore Visa Plans
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#F7F5F0] relative z-10 border-y border-[#CACACB]/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#3E3A35] mb-4">Why Perennials Visa?</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Trusted Expertise", desc: "Over a decade of experience securing complex visas globally with a 98% success rate." },
              { icon: CreditCard, title: "Transparent Pricing", desc: "Clear, upfront costs with no hidden fees. Select your preferred currency to see exact plan rates." },
              { icon: Clock, title: "Streamlined Process", desc: "Our dedicated team accelerates processing times, handling the heavy lifting so you don't have to." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-8 hover:border-[#E2B87C]/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-[#FCFBF8] border border-[#E6DFD5] flex items-center justify-center mb-6 group-hover:border-[#E2B87C]/50 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#E2B87C]" />
                </div>
                <h3 className="text-xl font-semibold text-[#3E3A35] mb-3">{feature.title}</h3>
                <p className="text-[#7A7369]/80 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#3E3A35] mb-4">Featured Visa Plans</h2>
              <p className="text-[#7A7369] max-w-xl">Select a destination and start your application process today.</p>
            </div>

            {allCurrencies.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#7A7369]">Currency:</span>
                <div className="relative">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="appearance-none bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#E2B87C]"
                  >
                    {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronRight className="w-4 h-4 text-[#7A7369] absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredPlans.map((plan) => {
              const priceObj = plan.prices.find(p => p.currencyCode === selectedCurrency);

              return (
                <div key={plan.id} className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl overflow-hidden flex flex-col group hover:border-[#E2B87C]/40 transition-colors">
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{plan.flag}</span>
                      <span className="text-xs font-medium px-3 py-1 bg-[#FCFBF8] text-[#7A7369] rounded-full border border-[#E6DFD5]">
                        {plan.processingTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#3E3A35] mb-2">{plan.name}</h3>
                    <p className="text-sm text-[#7A7369]/70 mb-6 line-clamp-2">{plan.description}</p>

                    <div className="mb-6 flex-1">
                      {priceObj ? (
                        <>
                          <div className="text-2xl font-bold text-[#5C564D]">
                            {priceObj.currencySymbol}{priceObj.amount.toLocaleString()} <span className="text-sm font-normal text-[#7A7369]/50">{priceObj.currencyCode}</span>
                          </div>
                          <p className="text-[10px] text-[#7A7369]/40 mt-1 uppercase tracking-wider">{priceObj.note}</p>
                        </>
                      ) : (
                        <div className="text-sm font-medium text-[#7A7369]">Contact us for pricing in {selectedCurrency}</div>
                      )}
                    </div>

                    <ul className="space-y-2 mt-auto">
                      {plan.requirements.slice(0, 3).map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#7A7369]/80">
                          <CheckCircle className="w-3.5 h-3.5 text-[#E2B87C] shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border-t border-[#E6DFD5] bg-[#F0EEE9]">
                    <Button onClick={() => setCheckoutPlan(plan)} className="w-full">
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                      <span className="flex-1 text-center">Select Plan</span>
                      <Plane className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F7F5F0] relative z-10 border-y border-[#CACACB]/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#3E3A35] mb-4">How It Works</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] mx-auto rounded-full" />
          </div>

          <div className="w-full relative">
            <Stepper
              initialStep={1}
              onFinalStepCompleted={() => {}}
              backButtonText="Previous"
              nextButtonText="Next"
              contentClassName="bg-transparent mt-6"
            >
              {processSteps.map((step) => (
                <Step key={step.id}>
                  <div className="text-center px-4 py-8">
                    <h3 className="text-2xl font-semibold text-[#3E3A35] mb-4">{step.title}</h3>
                    <p className="text-[#7A7369] max-w-lg mx-auto mb-6 text-lg">{step.description}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCFBF8] border border-[#E2B87C]/30 rounded-full text-[#E2B87C] font-medium text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{step.time}</span>
                    </div>
                  </div>
                </Step>
              ))}
            </Stepper>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-32 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E3A35] mb-4">Client Success Stories</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] rounded-full mb-6" />
            <p className="text-[#7A7369] max-w-xl">Don't just take our word for it. Hear from travelers and professionals we've helped.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 md:gap-0 mb-12 max-w-5xl mx-auto px-4">
            {approvedReviews.map((review, i) => {

              const rotateStyles = [
                '-rotate-6 translate-y-4',
                '-rotate-2',
                'rotate-2 translate-y-2',
                'rotate-6 translate-y-6'
              ];
              const zIndexes = ['z-0', 'z-10', 'z-20', 'z-30'];
              const rotation = rotateStyles[i % rotateStyles.length];
              const zIndex = zIndexes[i % zIndexes.length];

              return (
                <div
                  key={review.id}
                  className={`w-full md:w-[320px] md:-ml-12 first:ml-0 relative ${zIndex} hover:z-50 group perspective-1000 transition-all duration-300 md:hover:-translate-y-8`}
                >
                  <div className={`md:transform ${rotation} group-hover:rotate-0 transition-transform duration-500 w-full h-full`}>
                    <TiltCard maxTiltX={15} maxTiltY={15} scaleOnHover={1.05} glareEffect={true}>
                      <div className="bg-[#FCFBF8] border border-[#D4C3A3] shadow-xl rounded-2xl p-6 relative flex flex-col h-full min-h-[280px]">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#8B6F4E] text-[#8B6F4E]' : 'fill-[#D4C3A3] text-transparent'}`} />
                            ))}
                          </div>
                          {review.status === 'approved' && (
                            <div className="flex items-center gap-1 bg-[#D3E4CD] text-[#4A7C59] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </div>
                          )}
                        </div>
                        <p className="text-[#3E3A35] text-sm leading-relaxed mb-6 italic flex-1">"{review.comment}"</p>
                        <div className="flex items-center gap-3 border-t border-[#D4C3A3]/50 pt-4">
                          <div className="w-10 h-10 rounded-full bg-[#D4C3A3]/50 flex items-center justify-center text-[#5C4A33] font-serif font-bold text-lg">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-[#3E3A35] text-sm font-bold">{review.name}</h4>
                            {review.country && <p className="text-[#8B6F4E] text-xs">{review.country} Visa</p>}
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-[#E2B87C] text-[#E2B87C] hover:bg-[#E2B87C] hover:text-white"
              onClick={() => {
                setShowReviewModal(true);
                setReviewSubmitted(false);
                setReviewRating(5);
              }}
            >
              Write a Review
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10 mx-4 md:mx-auto max-w-6xl mb-24 rounded-3xl overflow-hidden border border-[#E6DFD5]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F9FA] to-[#E9EDF5] z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 z-0" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 px-4 sm:px-8 py-12 md:py-20 items-center">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#3E3A35] mb-6">Get a Free Assessment</h2>
            <p className="text-[#7A7369] text-lg mb-10">Leave your details and our expert consultants will get back to you within 24 hours to discuss your visa options.</p>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 text-[#5C564D]">
                 <CheckCircle className="w-5 h-5 text-[#E2B87C]" />
                 <span>Free Profile Evaluation</span>
               </div>
               <div className="flex items-center gap-3 text-[#5C564D]">
                 <CheckCircle className="w-5 h-5 text-[#E2B87C]" />
                 <span>Tailored Visa Strategies</span>
               </div>
            </div>
          </div>
          
          <div className="bg-[#FCFBF8] p-6 sm:p-8 rounded-2xl border border-[#D9CFBE] shadow-xl">
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const data = Object.fromEntries(formData);
              // Save to applications as a lead
              
              const id = Date.now().toString();
              await addApplication({
                id,
                referenceId: `LEAD-${id.slice(-6)}`,
                name: data.name as string,
                email: data.email as string,
                phone: data.phone as string,
                planId: 'General Inquiry',
                submittedDate: new Date().toISOString(),
                status: 'Submitted',
                adminNote: `Lead Assessment\nDestination: ${data.destination}\nTravel Date: ${data.travelDate}\nPurpose: ${data.purpose}`
              });
              alert('Thank you! Your assessment request has been submitted.');
              form.reset();
            }}>
              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Full Name</label>
                <input required name="name" type="text" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Email Address</label>
                <input required name="email" type="email" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Phone Number</label>
                <input required name="phone" type="tel" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]" placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Intended Destination</label>
                <select required name="destination" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]">
                  <option value="">Select Destination</option>
                  <option value="Schengen">Schengen Area (Europe)</option>
                  <option value="Japan">Japan</option>
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7369] mb-1">Travel Date</label>
                  <input required name="travelDate" type="date" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7A7369] mb-1">Purpose</label>
                  <select required name="purpose" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]">
                    <option value="">Select Purpose</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Business">Business</option>
                    <option value="Family">Family/Friends</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4">Submit Request</Button>
            </form>
          </div>
        </div>
      </section>

      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0C34]/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FCFBF8] border border-[#D4C3A3] rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-[#7A7369] hover:text-[#3E3A35]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h2 className="text-2xl font-bold text-[#3E3A35] mb-2">Write a Review</h2>
            <p className="text-[#7A7369] text-sm mb-6">Share your experience with us.</p>
            
            {reviewSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#D3E4CD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#4A7C59]" />
                </div>
                <h3 className="text-xl font-bold text-[#3E3A35] mb-2">Thank You!</h3>
                <p className="text-[#7A7369]">Your review has been submitted and is pending approval.</p>
                <Button onClick={() => setShowReviewModal(false)} className="mt-6">Close</Button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmittingReview(true);
                const form = e.target as HTMLFormElement;
                const data = Object.fromEntries(new FormData(form));
                
                await addReview({
                  id: Date.now().toString(),
                  name: data.name as string,
                  rating: reviewRating,
                  comment: data.comment as string,
                  country: data.country as string,
                  status: 'pending',
                  date: new Date().toISOString().split('T')[0]
                });
                
                setIsSubmittingReview(false);
                setReviewSubmitted(true);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#7A7369] mb-1">Your Name</label>
                    <input required name="name" type="text" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#7A7369] mb-1">Country (Optional)</label>
                    <input name="country" type="text" placeholder="e.g. Japan" className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#7A7369] mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-[#8B6F4E] text-[#8B6F4E]' : 'fill-[#D4C3A3]/30 text-transparent hover:fill-[#D4C3A3]'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#7A7369] mb-1">Your Review</label>
                    <textarea required name="comment" rows={4} className="w-full bg-white border border-[#D9CFBE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" placeholder="Tell us about your experience..."></textarea>
                  </div>
                  
                  <Button type="submit" disabled={isSubmittingReview} className="w-full mt-2">
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
