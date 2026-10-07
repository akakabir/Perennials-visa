import React, { useEffect, useState, useRef } from 'react';
import { Plane } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useLocation } from 'react-router-dom';

function parseRgb(colorStr: string): [number, number, number] | null {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function matchesGoldOrShade(rgbStr: string): boolean {
  const rgb = parseRgb(rgbStr);
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // Gold/amber range check: warm golden tones (e.g. #E2B87C, #E8C58C, #DEB57B)
  // Has warmth: r > g and g > b, strong red-blue delta (r - b >= 35), brightness >= 150
  return r >= 165 && g >= 130 && b >= 80 && r > g && g > b && (r - b) >= 35 && (r - g) <= 65;
}

function isSameColorOrShade(el: Element | null): boolean {
  let curr = el;
  let depth = 0;
  while (curr && curr !== document.body && curr !== document.documentElement && depth < 8) {
    const cls = (typeof curr.className === 'string' ? curr.className : '').toLowerCase();
    
    // Explicit class & attribute indicators for gold elements
    if (
      cls.includes('specular-button') ||
      cls.includes('bg-[#e2b87c]') ||
      cls.includes('from-[#e2b87c]') ||
      cls.includes('to-[#e2b87c]') ||
      cls.includes('bg-[#e8c58c]') ||
      cls.includes('text-[#e2b87c]') ||
      cls.includes('border-[#e2b87c]') ||
      cls.includes('fill-[#8b6f4e]') ||
      cls.includes('text-[#8b6f4e]') ||
      cls.includes('bg-[#d4c3a3]') ||
      cls.includes('bg-[#deb57b]') ||
      cls.includes('bg-[#c9a26b]') ||
      curr.getAttribute('data-variant') === 'primary' ||
      (curr.tagName === 'BUTTON' && !cls.includes('outline') && !cls.includes('ghost') && !cls.includes('bg-transparent'))
    ) {
      return true;
    }

    // Computed style background check
    try {
      const style = window.getComputedStyle(curr);
      const bg = style.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        if (matchesGoldOrShade(bg)) return true;
      }
      const color = style.color;
      if (color && matchesGoldOrShade(color)) {
        if (curr.tagName === 'SPAN' || curr.tagName === 'P' || curr.tagName === 'SVG' || curr.tagName === 'PATH') {
          return true;
        }
      }
    } catch {}

    curr = curr.parentElement;
    depth++;
  }
  return false;
}

// [UI COMPONENT] Cursor - Renders the Cursor view
export function Cursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const isDarkRef = useRef(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateAngle = useSpring(45, { stiffness: 100, damping: 15, mass: 1 });
  
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      document.body.style.cursor = 'auto';
      return;
    }
    
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    let lastX = 0;
    let lastY = 0;
    let currentAngle = 45;

    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;
        let deltaAngle = targetAngle - (currentAngle % 360);
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        currentAngle += deltaAngle;
        rotateAngle.set(currentAngle);
      }
      
      lastX = e.clientX;
      lastY = e.clientY;

      // Detect underlying element color shade to toggle darker contrast on matching shades
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const isMatching = isSameColorOrShade(target) || 
        isSameColorOrShade(document.elementFromPoint(e.clientX - 6, e.clientY - 6)) ||
        isSameColorOrShade(document.elementFromPoint(e.clientX + 6, e.clientY + 6));

      if (isMatching !== isDarkRef.current) {
        isDarkRef.current = isMatching;
        setIsDark(isMatching);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    document.body.style.cursor = 'none';
    
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.body.style.cursor = 'auto';
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [mouseX, mouseY, rotateAngle, isAdmin]);

  if (isTouchDevice || isAdmin) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center drop-shadow-md"
      style={{
        x: mouseX,
        y: mouseY,
        rotate: rotateAngle,
        translateX: '-50%',
        translateY: '-50%'
      }}
    >
      <Plane 
        size={24} 
        strokeWidth={isDark ? 2.2 : 1.5} 
        className={
          isDark 
            ? "text-[#704712] fill-[#704712]/35 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-colors duration-150" 
            : "text-[#E2B87C] fill-transparent drop-shadow-md transition-colors duration-150"
        } 
      />
    </motion.div>
  );
}
