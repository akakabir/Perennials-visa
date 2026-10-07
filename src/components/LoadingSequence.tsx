import React, { useEffect, useState } from 'react';

type SequencePhase = 1 | 2 | 3 | 4 | 5 | 6 | 'done';

// [UI COMPONENT] LoadingSequence - Continuous 6-Phase Intro Sequence
export function LoadingSequence() {
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [phase, setPhase] = useState<SequencePhase>(1);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsReducedMotion(true);
    }
  }, []);

  // Continuous seamless flow: no pauses, plays straight through
  useEffect(() => {
    if (hasCompleted) return;

    if (isReducedMotion) {
      const timer = setTimeout(() => {
        setHasCompleted(true);
      }, 400);
      return () => clearTimeout(timer);
    }

    if (phase === 1) {
      // Phase 1: Passport scales & fades in (500ms)
      const timer = setTimeout(() => setPhase(2), 500);
      return () => clearTimeout(timer);
    } else if (phase === 2) {
      // Phase 2: Book cover rotates open (400ms)
      const timer = setTimeout(() => setPhase(3), 400);
      return () => clearTimeout(timer);
    } else if (phase === 3) {
      // Phase 3: Vertical VISA draws + Green Stamp slams down with bounce (700ms)
      const timer = setTimeout(() => setPhase(4), 700);
      return () => clearTimeout(timer);
    } else if (phase === 4) {
      // Phase 4: Book cover rotates closed (400ms)
      const timer = setTimeout(() => setPhase(5), 400);
      return () => clearTimeout(timer);
    } else if (phase === 5) {
      // Phase 5: Flipped trolley bag rolls across (800ms)
      const timer = setTimeout(() => setPhase(6), 800);
      return () => clearTimeout(timer);
    } else if (phase === 6) {
      // Phase 6: Horizontal plane sweeps & wipes screen to reveal site (1300ms - majestic, slower)
      const timer = setTimeout(() => {
        setPhase('done');
        setHasCompleted(true);
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [phase, hasCompleted, isReducedMotion]);

  if (hasCompleted || phase === 'done') {
    return null;
  }

  // Reduced Motion Fallback View
  if (isReducedMotion) {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0A0F2C] select-none pointer-events-none">
        <div className="flex flex-col items-center gap-4">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="#E2B87C" strokeWidth="3" />
            <path
              d="M32 16 L35 27 L46 27 L37 34 L40 45 L32 38 L24 45 L27 34 L18 27 L29 27 Z"
              fill="#E2B87C"
            />
          </svg>
          <div className="font-serif text-[#E2B87C] tracking-[0.25em] text-sm uppercase font-bold">
            Perennials Visa
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999999] overflow-hidden select-none pointer-events-none">
      <style>{`
        /* Phase 1: Passport entry */
        @keyframes pv-phase1-in {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Phase 2: Open left cover */
        @keyframes pv-phase2-open {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }

        /* Phase 3: Vertical letter pop */
        @keyframes pv-letter-pop {
          0% {
            opacity: 0;
            transform: translateY(-6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Phase 3: Green stamp impact bounce */
        @keyframes pv-stamp-slam {
          0% {
            opacity: 0;
            transform: scale(2.4) rotate(-24deg);
          }
          50% {
            opacity: 1;
            transform: scale(0.92) rotate(-8deg);
          }
          75% {
            transform: scale(1.08) rotate(-9deg);
          }
          100% {
            opacity: 1;
            transform: scale(1.0) rotate(-8deg);
          }
        }

        /* Phase 4: Close left cover */
        @keyframes pv-phase4-close {
          0% {
            transform: rotateY(-180deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }

        /* Phase 5: Trolley bag rolling across from left to right */
        @keyframes pv-bag-roll {
          0% {
            opacity: 0;
            transform: translate3d(-110px, 0, 0);
          }
          15% {
            opacity: 1;
            transform: translate3d(-70px, 0, 0);
          }
          85% {
            opacity: 1;
            transform: translate3d(70px, 0, 0);
          }
          100% {
            opacity: 0;
            transform: translate3d(110px, 0, 0);
          }
        }

        /* Phase 5: Wheel rotation */
        @keyframes pv-wheel-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(720deg);
          }
        }

        /* Phase 6: Horizontal plane sweeps from left to right across full screen (1.3s slower sweep) */
        @keyframes pv-plane-horizontal-fly {
          0% {
            transform: translate3d(-80vw, -50%, 0);
          }
          100% {
            transform: translate3d(125vw, -50%, 0);
          }
        }

        /* Phase 6: Wake reveal - cuts away navy background behind plane wings to reveal site */
        @keyframes pv-plane-wake-reveal {
          0% {
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          }
          100% {
            clip-path: polygon(125% 0%, 100% 0%, 100% 100%, 125% 100%);
          }
        }
      `}</style>

      {/* SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <linearGradient id="pvPlaneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#E2B87C" />
            <stop offset="70%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Background Screen: Solid Navy for Phases 1-5; 70% blurred backdrop for Phase 6 */}
      <div
        className={`absolute inset-0 will-change-transform transition-all duration-300 ${
          phase === 6
            ? 'bg-black/25 backdrop-blur-[14px]'
            : 'bg-[#0A0F2C]'
        }`}
      >
        {/* ========================================================================= */}
        {/* PHASE 1: Closed Passport Fades & Scales into Center                      */}
        {/* ========================================================================= */}
        {phase === 1 && (
          <div
            className="w-full h-full flex items-center justify-center will-change-transform"
            style={{ animation: 'pv-phase1-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <PassportClosedOutline />
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASES 2, 3, 4: Passport Book Opens, VISA Stamped, Passport Closes       */}
        {/* ========================================================================= */}
        {(phase === 2 || phase === 3 || phase === 4) && (
          <div className="w-full h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
            <div className="relative flex items-center justify-center" style={{ width: '380px', height: '260px' }}>
              {/* UNDERNEATH: The Two-Page Spread */}
              <div className="absolute inset-0 flex rounded-2xl bg-[#0B1133] shadow-2xl overflow-hidden border-[3.5px] border-[#E2B87C]">
                {/* Left Page (ID Silhouette Page) */}
                <div className="w-1/2 h-full border-r-[3.5px] border-[#E2B87C] p-5 flex flex-col justify-between items-center bg-[#080D28]">
                  <div className="w-full flex justify-between text-[#E2B87C]/70 text-xs font-serif font-bold tracking-widest">
                    <span>PASSPORT</span>
                    <span>P</span>
                  </div>
                  {/* Photo Outline Box */}
                  <div className="w-20 h-24 rounded-lg border-2 border-dashed border-[#C7CCD8]/60 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C7CCD8" strokeWidth="2">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M 5 20 C 5 15 19 15 19 20" />
                    </svg>
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <div className="h-1.5 w-3/4 bg-[#E2B87C]/40 rounded-full" />
                    <div className="h-1.5 w-1/2 bg-[#C7CCD8]/30 rounded-full" />
                  </div>
                </div>

                {/* Right Page (Visa Stamp Page) */}
                <div className="w-1/2 h-full p-5 flex flex-col justify-between bg-[#0B1133] relative">
                  <div className="flex justify-between text-[#E2B87C] text-xs font-serif font-bold tracking-widest">
                    <span>VISA</span>
                    <span>PAGE 01</span>
                  </div>

                  {/* Central Area: Vertical VISA + Green Circular Tick Stamp */}
                  <div className="relative flex-1 flex items-center justify-around">
                    {/* Vertical "VISA" Letters (one letter per line, top to bottom) */}
                    {(phase === 3 || phase === 4) && (
                      <div className="flex flex-col items-center justify-center font-serif text-[#E2B87C] text-2xl font-black leading-tight tracking-wider select-none">
                        <span style={{ animation: 'pv-letter-pop 0.15s ease-out forwards' }}>V</span>
                        <span style={{ animation: 'pv-letter-pop 0.2s ease-out forwards' }}>I</span>
                        <span style={{ animation: 'pv-letter-pop 0.25s ease-out forwards' }}>S</span>
                        <span style={{ animation: 'pv-letter-pop 0.3s ease-out forwards' }}>A</span>
                      </div>
                    )}

                    {/* Green Circular Tick Stamp (Impacts Down with Bounce) */}
                    {(phase === 3 || phase === 4) && (
                      <div
                        className="flex items-center justify-center pointer-events-none will-change-transform"
                        style={{
                          animation: 'pv-stamp-slam 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                        }}
                      >
                        <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                          <circle cx="48" cy="48" r="42" stroke="#10B981" strokeWidth="4" />
                          <circle cx="48" cy="48" r="33" stroke="#10B981" strokeWidth="2" strokeDasharray="5 5" />
                          <path
                            d="M 34 48 L 44 58 L 64 36"
                            stroke="#10B981"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-[#10B981] font-mono tracking-wider font-bold text-center">
                    ★ APPROVED ★
                  </div>
                </div>
              </div>

              {/* 3D ROTATING LEFT COVER */}
              <div
                className="absolute left-0 top-0 w-1/2 h-full z-20 origin-right will-change-transform"
                style={{
                  transformStyle: 'preserve-3d',
                  animation:
                    phase === 2
                      ? 'pv-phase2-open 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                      : phase === 4
                      ? 'pv-phase4-close 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                      : 'none',
                  transform: phase === 3 ? 'rotateY(-180deg)' : undefined
                }}
              >
                {/* Front Cover */}
                <div
                  className="absolute inset-0 rounded-l-2xl border-[3.5px] border-[#E2B87C] bg-[#0A0F2C] flex flex-col items-center justify-center p-4 overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="font-serif text-[#E2B87C] text-sm font-bold tracking-[0.2em] uppercase">
                    PASSPORT
                  </div>
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="my-auto">
                    <circle cx="30" cy="30" r="24" stroke="#E2B87C" strokeWidth="3" />
                    <ellipse cx="30" cy="30" rx="12" ry="24" stroke="#E2B87C" strokeWidth="2.5" />
                    <line x1="6" y1="30" x2="54" y2="30" stroke="#E2B87C" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Back of Cover (Visible when open) */}
                <div
                  className="absolute inset-0 rounded-r-2xl border-[3.5px] border-[#E2B87C] bg-[#080D28]"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 5: True Side-View Trolley Bag (Tilted 65°, Single Back-Corner Wheel) */}
        {/* ========================================================================= */}
        {phase === 5 && (
          <div
            className="w-full h-full flex items-center justify-center will-change-transform"
            style={{ animation: 'pv-bag-roll 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
          >
            {/* Horizontally mirrored side-view bag */}
            <div
              className="relative w-56 h-72 flex items-center justify-center"
              style={{
                transform: 'scaleX(-1) rotate(-25deg)',
                transformOrigin: 'center center'
              }}
            >
              <svg width="210" height="270" viewBox="0 0 210 270" fill="none">
                {/* Telescopic Pull Handle (extending up from back top corner) */}
                <line x1="56" y1="62" x2="56" y2="14" stroke="#C7CCD8" strokeWidth="3.5" strokeLinecap="round" />
                <rect x="42" y="8" width="30" height="12" rx="4" stroke="#E2B87C" strokeWidth="3" fill="#0A0F2C" />

                {/* Side-View Luggage Shell (Side profile depth) */}
                <rect
                  x="48"
                  y="62"
                  width="78"
                  height="154"
                  rx="16"
                  stroke="#E2B87C"
                  strokeWidth="4"
                  fill="#0B1133"
                />

                {/* Central Zipper / Expansion Seam on side face */}
                <line x1="87" y1="64" x2="87" y2="214" stroke="#E2B87C" strokeWidth="2.5" strokeDasharray="5 4" />

                {/* Side Carry Handle */}
                <rect x="79" y="122" width="16" height="36" rx="6" stroke="#C7CCD8" strokeWidth="3.5" fill="#0A0F2C" />

                {/* Front Bottom Resting Foot Pad */}
                <rect x="110" y="216" width="10" height="6" rx="2" fill="#C7CCD8" stroke="#C7CCD8" strokeWidth="1" />

                {/* Single Back-Corner Wheel (Only 1 wheel in side view, rolling on ground) */}
                <g transform="translate(56, 224)">
                  <circle cx="0" cy="0" r="14" stroke="#E2B87C" strokeWidth="3.5" fill="#0A0F2C" />
                  <circle cx="0" cy="0" r="3" fill="#E2B87C" />
                  <g style={{ animation: 'pv-wheel-spin 0.8s linear forwards' }}>
                    <line x1="-10" y1="0" x2="10" y2="0" stroke="#C7CCD8" strokeWidth="3" strokeLinecap="round" />
                    <line x1="0" y1="-10" x2="0" y2="10" stroke="#C7CCD8" strokeWidth="3" strokeLinecap="round" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PHASE 6: Horizontal Airplane Flyover & Wake Reveal (Reveals Site)        */}
      {/* ========================================================================= */}
      {phase === 6 && (
        <div
          className="absolute top-[50%] left-0 flex items-center justify-center pointer-events-none will-change-transform z-[1000000]"
          style={{
            width: '100vh',
            height: '100vh',
            animation: 'pv-plane-horizontal-fly 1.3s cubic-bezier(0.25, 0, 0.15, 1) forwards'
          }}
        >
          {/*
            Horizontal Airplane:
            Lucide Plane path rotated clockwise +45deg:
            Nose points directly horizontally to the right (→).
            Fuselage is 100% horizontal.
            Wingspan extends from top to bottom (height: 100vh).
            Behind the wings, the website is revealed in real-time as it flies!
          */}
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full will-change-transform"
            style={{ transform: 'rotate(45deg)' }}
          >
            <path
              d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
              fill="#E2B87C"
              stroke="#E2B87C"
              strokeWidth="0.2"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Clean Closed Passport Outline (Thick 3.5px Line-Art)
function PassportClosedOutline() {
  return (
    <div className="relative w-48 h-68 rounded-2xl border-[3.5px] border-[#E2B87C] bg-[#0A0F2C] shadow-2xl p-6 flex flex-col justify-between items-center">
      {/* Title */}
      <div className="font-serif text-[#E2B87C] text-base font-bold tracking-[0.25em] uppercase text-center">
        PASSPORT
      </div>

      {/* Bold Globe Emblem */}
      <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
        <circle cx="42" cy="42" r="36" stroke="#E2B87C" strokeWidth="3.5" />
        <ellipse cx="42" cy="42" rx="18" ry="36" stroke="#E2B87C" strokeWidth="3" />
        <line x1="6" y1="42" x2="78" y2="42" stroke="#E2B87C" strokeWidth="3" />
        <polygon points="42,26 46,38 58,42 46,46 42,58 38,46 26,42 38,38" fill="#E2B87C" />
      </svg>

      {/* Biometric Chip Symbol */}
      <svg width="44" height="26" viewBox="0 0 44 26" fill="none">
        <rect x="2" y="2" width="40" height="22" rx="4" stroke="#E2B87C" strokeWidth="3" />
        <line x1="0" y1="13" x2="44" y2="13" stroke="#E2B87C" strokeWidth="3" />
        <circle cx="22" cy="13" r="5" stroke="#E2B87C" strokeWidth="3" fill="#0A0F2C" />
      </svg>
    </div>
  );
}
