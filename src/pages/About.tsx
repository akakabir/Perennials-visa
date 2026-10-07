import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Compass, Users, CheckCircle, Globe2, FileText, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAppContext } from '../store/AppContext';

// [UI COMPONENT] About - Renders the dedicated About Us view
export default function About() {
  const { siteSettings } = useAppContext();

  const handleWhatsApp = () => {
    const rawPhone = siteSettings?.whatsapp || '971501234567';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Perennials Visa team, I would like to learn more about your services.')}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full pb-32">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F4] border border-[#E2B87C]/40 rounded-md text-[#E2B87C] font-mono text-xs font-bold uppercase tracking-wider mb-6">
          <Globe2 className="w-4 h-4" />
          <span>OUR STORY & PHILOSOPHY</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3E3A35] font-serif mb-6 leading-tight">
          Crafting Smooth Horizons for Global Travelers
        </h1>

        <p className="text-lg md:text-xl text-[#7A7369] max-w-3xl mx-auto leading-relaxed font-light mb-10">
          Perennials Visa was founded with a singular purpose: turning complex international visa requirements into a transparent, stress-free journey.
        </p>
      </section>

      {/* Main Philosophy Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-3xl p-8 sm:p-14 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold text-[#E2B87C] tracking-widest uppercase mb-3">
              WHAT WE BELIEVE
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#3E3A35] mb-6">
              Travel Should Be Inspiring, Not Overwhelming.
            </h2>
            <p className="text-[#7A7369] text-base leading-relaxed mb-6 font-light">
              Securing a visa shouldn't involve guessing obscure embassy requirements or sifting through outdated forum advice. We provide comprehensive, up-to-date documentation support tailored to your unique itinerary.
            </p>
            <p className="text-[#7A7369] text-base leading-relaxed font-light">
              We focus exclusively on tourism and short-stay business visas. By focusing our expertise solely on these categories, our team delivers deep, destination-specific insight that ensures your paperwork is thorough and compliant.
            </p>
          </div>

          <div className="bg-[#FAF8F4] border border-[#E6DFD5] rounded-2xl p-8 space-y-6">
            <h3 className="font-serif font-bold text-xl text-[#3E3A35]">
              Our Promise to You
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E2B87C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#3E3A35]">Exclusively Tourism & Business</h4>
                  <p className="text-xs text-[#7A7369] leading-relaxed">No confusing immigration promises or work permits. We stick to our specialty.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E2B87C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#3E3A35]">100% Transparent Fees</h4>
                  <p className="text-xs text-[#7A7369] leading-relaxed">Clear pricing with zero hidden surcharges or surprise billing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E2B87C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#3E3A35]">Real Human Guidance</h4>
                  <p className="text-xs text-[#7A7369] leading-relaxed">Direct WhatsApp coordination and personalized dossier reviews.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-[#3E3A35] mb-4">
            How We Support Your Journey
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-8 hover:border-[#E2B87C]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#FAF8F4] border border-[#E6DFD5] flex items-center justify-center text-[#E2B87C] mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#3E3A35] mb-3">Dossier Preparation</h3>
            <p className="text-sm text-[#7A7369] leading-relaxed font-light">
              From application forms to flight itineraries and accommodation bookings, every document is checked against current embassy criteria.
            </p>
          </div>

          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-8 hover:border-[#E2B87C]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#FAF8F4] border border-[#E6DFD5] flex items-center justify-center text-[#E2B87C] mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#3E3A35] mb-3">Appointment & Procedure Guidance</h3>
            <p className="text-sm text-[#7A7369] leading-relaxed font-light">
              We guide you step-by-step through submission procedures, biometrics booking, and what to expect during in-person visits.
            </p>
          </div>

          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-8 hover:border-[#E2B87C]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#FAF8F4] border border-[#E6DFD5] flex items-center justify-center text-[#E2B87C] mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#3E3A35] mb-3">End-to-End Follow Up</h3>
            <p className="text-sm text-[#7A7369] leading-relaxed font-light">
              Continuous tracking and prompt assistance if consular authorities request additional supporting paperwork.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-[#FAF8F4] border border-[#E6DFD5] rounded-3xl p-10 sm:p-14 shadow-sm">
          <h2 className="text-3xl font-serif font-bold text-[#3E3A35] mb-4">
            Ready to Plan Your Next Trip?
          </h2>
          <p className="text-[#7A7369] text-base mb-8 max-w-xl mx-auto">
            Explore our curated visa plans or message us directly on WhatsApp to get tailored guidance for your destination.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/#plans">
              <Button size="lg" className="flex items-center gap-2">
                <span>Explore Visa Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Button size="lg" onClick={handleWhatsApp} className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
