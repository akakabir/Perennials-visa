import React from 'react';
import { cn } from '../lib/utils';
import SpecularButton from './SpecularButton';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

// [UI COMPONENT] Button - Renders the Button view with React Bits Specular effect
export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  
  if (variant === 'ghost') {
    const baseStyles = "relative inline-flex items-center justify-center font-semibold overflow-hidden rounded-full transition-all duration-300 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E2B87C] active:scale-[0.98]";
    const sizes = { sm: "text-sm px-4 py-2 min-h-[38px]", md: "text-base px-6 py-2.5 min-h-[48px]", lg: "text-base px-8 py-3.5 min-h-[54px]" };
    return (
      <button 
        className={cn(baseStyles, sizes[size], "bg-transparent text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#F0EEE9]/80 border border-transparent shadow-none", className)}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2 w-full tracking-wide drop-shadow-sm">{children}</span>
      </button>
    );
  }

  // Perennial Visa colors derived directly from call button:
  // Primary: call button gold #E2B87C with deep contrast text #0A0A31
  // Secondary: soft warm background #F0EEE9 with dark text #3E3A35
  // Outline: transparent background with call button gold rim #E2B87C and gold text
  const getTint = () => {
    if (isPrimary) return '#E2B87C'; // Gold from call button
    if (isSecondary) return '#F0EEE9';
    return 'transparent'; // outline
  };

  const getTextColor = () => {
    if (isPrimary) return '#0A0A31';
    if (isSecondary) return '#3E3A35';
    return '#E2B87C'; // outline gold #E2B87C
  };
  
  const getBaseColor = () => {
    if (isPrimary) return '#E2B87C'; // Base gold #E2B87C
    if (isSecondary) return '#D9CFBE';
    return '#E2B87C'; // Gold #E2B87C
  };
  
  const getLineColor = () => {
    return '#D2D2D2'; // Silver from logo emblem
  };

  const getTintOpacity = () => {
    if (isPrimary) return 1;
    if (isSecondary) return 1;
    return 0; // outline
  };

  return (
    <SpecularButton
      size={size}
      radius={9999}
      className={className}
      tint={getTint()}
      tintOpacity={getTintOpacity()}
      textColor={getTextColor()}
      lineColor={getLineColor()}
      baseColor={getBaseColor()}
      intensity={1.2}
      idleIntensity={0.35}
      shineSize={12}
      shineFade={36}
      thickness={1.4}
      glow={1.2}
      followMouse={true}
      proximity={250}
      data-variant={variant}
      {...props}
    >
      {children}
    </SpecularButton>
  );
}
