import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe2, Menu, X, Plane } from 'lucide-react';
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
  ];

  const [logoError, setLogoError] = useState(false);

  return (
    <>
      <header className={cn(
        "fixed top-[env(safe-area-inset-top,1rem)] left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[92%] md:w-[85%] max-w-6xl mt-4",
      )}>
        <div className={cn(
          "flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 md:py-4 rounded-full backdrop-blur-md border shadow-lg transition-all duration-500",
          scrolled
            ? "bg-[#FCFBF8]/90 border-[#E6DFD5] shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-2"
            : "bg-[#FCFBF8]/60 border-transparent shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        )}>

          <Link to="/" className="flex items-center gap-2 group relative z-10 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#0C0C34] rounded-full p-0 shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 overflow-hidden">
              <img 
                src={logoError ? "/logo.png" : (siteSettings?.logoUrl || "/logo.png")} 
                alt={`${siteSettings?.siteName || 'Perennials Visa'} Logo`} 
                className="w-[85%] h-[85%] object-contain drop-shadow-sm" 
                onError={() => setLogoError(true)}
              />
            </div>
            <span className="font-bold text-sm sm:text-base md:text-xl tracking-wider text-[#3E3A35] truncate max-w-[120px] sm:max-w-none block">{siteSettings?.siteName?.toUpperCase() || 'PERENNIALS'}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-sm font-medium text-[#7A7369] hover:text-[#5C564D] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <Button size="sm" className="hidden md:flex" onClick={() => {
              if (location.pathname === '/') {
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/#plans';
              }
            }}>
              Get Started
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
            className="fixed top-[calc(env(safe-area-inset-top,1rem)+5rem)] left-[4%] right-[4%] z-40 bg-[#F0EEE9] border border-[#E6DFD5] rounded-3xl shadow-2xl p-6 md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-lg font-medium text-[#7A7369] hover:text-[#5C564D] transition-colors py-2 border-b border-[#CACACB]/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Button className="mt-4 w-full" onClick={() => { 
                setMobileMenuOpen(false); 
                if (location.pathname === '/') {
                  setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100);
                } else {
                  window.location.href = '/#plans'; 
                }
              }}>
                Get Started
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
