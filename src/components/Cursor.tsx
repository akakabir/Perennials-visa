import React, { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useLocation } from 'react-router-dom';

// [UI COMPONENT] Cursor - Renders the Cursor view
export function Cursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
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
      <Plane size={24} strokeWidth={1.5} className="text-[#E2B87C] fill-transparent" />
    </motion.div>
  );
}
