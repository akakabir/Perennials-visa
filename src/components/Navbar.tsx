import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe2, Menu, X, Plane, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store/AppContext';

// [UI COMPONENT] Navbar - Renders the Navbar view
export function Navbar() {
  const { siteSettings } = useAppContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleInquire = () => {
    const rawPhone = siteSettings?.whatsapp || '971501234567';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Perennials Visa team, I would like to inquire about your visa services.')}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Visa Plans', path: '/#plans' },
    { name: 'About Us', path: '/about' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contact', path: '/#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      const targetId = path.substring(2);
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [logoError, setLogoError] = useState(false);

  return (
    <>
      <header className={cn(
        "fixed top-[env(safe-area-inset-top,1rem)] left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[94%] md:w-[88%] max-w-6xl mt-4",
      )}>
        <div className={cn(
          "flex items-center justify-between px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full backdrop-blur-md border shadow-lg transition-all duration-500",
          scrolled
            ? "bg-[#FCFBF8]/90 border-[#E6DFD5] shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-1.5"
            : "bg-[#FCFBF8]/60 border-transparent shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        )}>

          <Link to="/" className="flex items-center gap-2 group relative z-10 shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 aspect-square bg-[#0C0C34] rounded-full p-0 shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 overflow-hidden">
              <img 
                src={logoError ? "/logo.png" : (siteSettings?.logoUrl || "/logo.png")} 
                alt={`${siteSettings?.siteName || 'Perennials Visa'} Logo`} 
                className="w-[85%] h-[85%] object-contain drop-shadow-sm" 
                onError={() => setLogoError(true)}
              />
            </div>
            <span className="font-semibold text-xs sm:text-sm md:text-base tracking-wider text-[#3E3A35] whitespace-nowrap block">
              {siteSettings?.siteName?.toUpperCase() || 'PERENNIALS VISA'}
            </span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-5 lg:gap-7 flex-1 mx-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={cn(
                  "text-xs lg:text-sm font-medium transition-colors relative group py-1",
                  location.pathname === link.path ? "text-[#3E3A35] font-semibold" : "text-[#7A7369] hover:text-[#3E3A35]"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] transition-all duration-300 rounded-full",
                  location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Button size="sm" className="hidden md:flex gap-1.5" onClick={handleInquire}>
              <span>Inquire</span>
              <MessageCircle className="w-4 h-4" />
            </Button>

            <button
              className="md:hidden text-[#7A7369] hover:text-[#3E3A35] transition-colors p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[calc(env(safe-area-inset-top,1rem)+4.5rem)] left-[4%] right-[4%] z-40 bg-[#F0EEE9] border border-[#E6DFD5] rounded-3xl shadow-2xl p-6 md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-base font-medium text-[#7A7369] hover:text-[#5C564D] transition-colors py-2 border-b border-[#CACACB]/10"
                  onClick={(e) => {
                    handleNavClick(e, link.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.name}
                </a>
              ))}
              <Button className="mt-4 w-full flex items-center justify-center gap-2" onClick={() => { 
                setMobileMenuOpen(false); 
                handleInquire();
              }}>
                <span>Inquire</span>
                <MessageCircle className="w-4 h-4" />
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
