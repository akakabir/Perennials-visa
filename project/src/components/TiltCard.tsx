import React, { useRef, useState, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTiltX?: number;
  maxTiltY?: number;
  perspective?: number;
  scaleOnHover?: number;
  glareEffect?: boolean;
}

// [UI COMPONENT] TiltCard - Renders the TiltCard view
export default function TiltCard({
  children,
  className = '',
  maxTiltX = 8,
  maxTiltY = 8,
  perspective = 1000,
  scaleOnHover = 1.03,
  glareEffect = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isReducedMotion) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
    const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

    const rX = -mouseY * maxTiltX;
    const rY = mouseX * maxTiltY;

    setRotateX(rX);
    setRotateY(rY);

    if (glareEffect) {
      const glareX = ((e.clientX - rect.left) / width) * 100;
      const glareY = ((e.clientY - rect.top) / height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className={`w-full h-full ${className}`}
    >
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered && !isReducedMotion
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, 1.03)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered && !isReducedMotion ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        className={`relative transition-all transform-gpu will-change-transform w-full h-full ${className}`}
      >
        {children}

        {glareEffect && !isReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 225, 180, 0.35) 0%, rgba(255, 255, 255, 0) 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
