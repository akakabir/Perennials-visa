import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FolderFAQ } from '../components/FolderFAQ';
import { Button } from '../components/Button';
import { useAppContext } from '../store/AppContext';

// [UI COMPONENT] FAQs - Renders the dedicated FAQs view
export default function FAQs() {
  const { siteSettings } = useAppContext();

  const handleWhatsApp = () => {
    const rawPhone = siteSettings?.whatsapp || '971501234567';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Perennials Visa team, I have a question regarding visa applications.')}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full pb-32">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F4] border border-[#E2B87C]/40 rounded-md text-[#E2B87C] font-mono text-xs font-bold uppercase tracking-wider mb-6">
          <HelpCircle className="w-4 h-4" />
          <span>HELP & CLARITY</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3E3A35] font-serif mb-6">
          Frequently Asked Questions
        </h1>

        <p className="text-base sm:text-lg text-[#7A7369] max-w-2xl mx-auto leading-relaxed font-light mb-12">
          Clear, transparent answers about our visa consultancy services, documentation support, and application procedures.
        </p>

        {/* Folder-Tab Accordion FAQ Component */}
        <FolderFAQ />

        {/* Contact Assistance Footer Card */}
        <div className="mt-20 bg-[#FCFBF8] border border-[#E6DFD5] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-sm">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3E3A35] mb-4">
            Still Have Questions?
          </h3>
          <p className="text-[#7A7369] text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Our consultation team is available on WhatsApp to answer any destination-specific queries or review your travel schedule.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleWhatsApp} className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>Chat with Us on WhatsApp</span>
            </Button>
            <Link to="/">
              <Button size="lg" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
