import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { useAppContext } from '../store/AppContext';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What types of visas does Perennials assist with?',
    answer: 'We specialize in providing assistance for tourism and short-stay business visa applications to destinations worldwide.'
  },
  {
    id: 'faq-2',
    question: 'Do you handle work or employment visas?',
    answer: 'No. Perennials focuses exclusively on tourism and short-stay business visa applications. We do not assist with work visas, employment permits, immigration, or permanent residency.'
  },
  {
    id: 'faq-3',
    question: 'Can you guarantee visa approval?',
    answer: 'No. Visa decisions are made solely by the relevant embassy, consulate, or immigration authority. Perennials provides professional assistance with application preparation and documentation, but we cannot guarantee the outcome of any application.'
  },
  {
    id: 'faq-4',
    question: 'Do I need to visit your office?',
    answer: 'Initial consultations and document coordination can often be handled remotely for your convenience. However, some application processes may require your physical attendance at an embassy or application center, depending on the destination and application procedure.'
  },
  {
    id: 'faq-5',
    question: 'How do I start?',
    answer: 'You can start by contacting us directly through WhatsApp or phone or filling in the contact form at the end of the website. Tell us your intended destination and travel dates, and our team will guide you on the next steps.'
  },
  {
    id: 'faq-6',
    question: 'Do you assist with both tourism and business travel?',
    answer: 'Yes, we provide specialized assistance for both short-stay business visa applications and general tourism visas.'
  }
];

// [UI COMPONENT] FolderFAQ - Folder-tab accordion design matched to luxury palette
export function FolderFAQ({ items = FAQ_DATA }: { items?: FAQItem[] }) {
  const { siteSettings } = useAppContext();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const handleWhatsApp = () => {
    const rawPhone = siteSettings?.whatsapp || '971501234567';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Perennials Visa team, I have a question regarding visa applications.')}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const padIndex = (index + 1).toString().padStart(2, '0');

        return (
          <div key={item.id} className="relative group select-none">
            {/* Top Folder Tab */}
            <div className="flex">
              <div
                onClick={() => toggle(item.id)}
                className="cursor-pointer bg-[#DEB070] border-2 border-b-0 border-[#3E3A35] px-5 py-1.5 rounded-t-xl font-mono text-xs font-bold text-[#3E3A35] tracking-wider flex items-center gap-2 shadow-sm transition-colors group-hover:bg-[#E8BD7F]"
              >
                <span className="w-2 h-2 rounded-full bg-[#3E3A35]" />
                <span>PERENNIALS // FAQ {padIndex}</span>
              </div>
            </div>

            {/* Folder Main Container */}
            <div
              className={`bg-[#DEB070] border-2 border-[#3E3A35] rounded-b-2xl rounded-tr-2xl shadow-[0_6px_0_0_#3E3A35] transition-all overflow-hidden ${
                isOpen ? 'p-4 sm:p-6' : 'p-4 sm:p-5'
              }`}
            >
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="open-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {/* Inner Paper Sheet (Folder Content) */}
                    <div className="bg-[#FCFBF8] border-2 border-[#3E3A35] rounded-xl p-6 sm:p-8 mb-4 shadow-inner text-left">
                      <p className="font-serif text-[#3E3A35] text-base sm:text-lg leading-relaxed mb-6 font-normal">
                        {item.answer}
                      </p>

                      <div className="pt-4 border-t border-[#E6DFD5] flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-[#7A7369]">
                          Have specific questions about your destination?
                        </span>
                        <Button size="sm" onClick={handleWhatsApp} className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          <span>Ask on WhatsApp</span>
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Question Bar with Close X */}
                    <div
                      onClick={() => toggle(item.id)}
                      className="flex items-center justify-between cursor-pointer pt-1 px-1 group/bar"
                    >
                      <h3 className="font-serif font-bold text-base sm:text-lg md:text-xl text-[#3E3A35] group-hover/bar:text-[#0A0A31] transition-colors">
                        {item.question}
                      </h3>
                      <button
                        type="button"
                        aria-label="Collapse FAQ"
                        className="w-9 h-9 rounded-full bg-[#FCFBF8] border-2 border-[#3E3A35] flex items-center justify-center text-[#3E3A35] group-hover/bar:scale-105 transition-transform shrink-0 ml-4 shadow-sm"
                      >
                        <X className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="closed-bar"
                    onClick={() => toggle(item.id)}
                    className="flex items-center justify-between cursor-pointer group/bar"
                  >
                    <h3 className="font-serif font-bold text-base sm:text-lg md:text-xl text-[#3E3A35] group-hover/bar:text-[#0A0A31] transition-colors pr-4">
                      {item.question}
                    </h3>
                    <button
                      type="button"
                      aria-label="Expand FAQ"
                      className="w-9 h-9 rounded-full bg-[#FCFBF8] border-2 border-[#3E3A35] flex items-center justify-center text-[#3E3A35] group-hover/bar:scale-105 transition-transform shrink-0 shadow-sm"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
