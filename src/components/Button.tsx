import React from 'react';
import { cn } from '../lib/utils';
import SpecularButton from './SpecularButton';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

// [UI COMPONENT] Button - Renders the Button view
export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  
  if (variant === 'ghost') {
    const baseStyles = "relative inline-flex items-center justify-center font-semibold overflow-hidden rounded-full transition-all duration-300 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E2B87C] active:scale-[0.98]";
    const sizes = { sm: "text-sm px-4 py-2", md: "text-sm px-6 py-3", lg: "text-base px-8 py-4" };
    return (
      <button 
        className={cn(baseStyles, sizes[size], "bg-transparent text-[#7A7369] hover:text-[#5C564D] hover:bg-[#F0EEE9]/80 border border-transparent shadow-none", className)}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2 w-full tracking-wide drop-shadow-sm">{children}</span>
      </button>
    );
  }

  // Define colors based on variant
  const getTint = () => {
    if (isPrimary) return '#E8C58C';
    if (isSecondary) return '#E9EDF5';
    return 'transparent'; // outline
  };

  const getTextColor = () => {
    if (isPrimary) return '#ffffff';
    if (isSecondary) return '#0A0A31';
    return '#5C564D'; // outline
  };
  
  const getBaseColor = () => {
    if (isPrimary) return '#E2B87C';
    if (isSecondary) return '#CACACB';
    return '#E2B87C';
  };
  
  const getLineColor = () => {
    if (isPrimary) return '#ffffff';
    if (isSecondary) return '#ffffff';
    return '#E2B87C';
  };

  const getTintOpacity = () => {
    if (isPrimary) return 1;
    if (isSecondary) return 1;
    return 0; // outline
  };

  return (
    <SpecularButton
      size={size}
      radius={18}
      className={className}
      tint={getTint()}
      tintOpacity={getTintOpacity()}
      textColor={getTextColor()}
      lineColor={getLineColor()}
      baseColor={getBaseColor()}
      intensity={1.2}
      thickness={1}
      {...props}
    >
      {children}
    </SpecularButton>
  );
}

