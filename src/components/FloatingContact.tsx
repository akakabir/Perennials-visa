import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLocation } from 'react-router-dom';

// [UI COMPONENT] FloatingContact - Renders the FloatingContact view
export function FloatingContact() {
  const { siteSettings } = useAppContext();
  const location = useLocation();

  if (!siteSettings || location.pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,1rem)+1rem)] left-4 sm:left-6 z-40 flex flex-col gap-3">
      <motion.a
        href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.a>
      
      <motion.a
        href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-[#E2B87C] text-[#0A0A31] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        aria-label="Call Us"
      >
        <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.a>
    </div>
  );
}
