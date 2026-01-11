
import React from 'react';

interface SidebarTabProps {
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  origin: 'left' | 'bottom' | 'right';
}

export const SidebarTab: React.FC<SidebarTabProps> = ({ 
  isActive, 
  onClick, 
  onMouseEnter, 
  label, 
  subLabel, 
  icon, 
  origin 
}) => {
  // Determine scale classes based on origin
  let activeScaleClass = '';
  let inactiveScaleClass = '';
  
  switch(origin) {
    case 'left':
        activeScaleClass = 'scale-x-100';
        inactiveScaleClass = 'scale-x-0';
        break;
    case 'bottom':
        activeScaleClass = 'scale-y-100';
        inactiveScaleClass = 'scale-y-0';
        break;
    case 'right':
        activeScaleClass = 'scale-x-100';
        inactiveScaleClass = 'scale-x-0';
        break;
  }

  // Need to adjust origin class for transform
  const originClass = `origin-${origin}`;

  return (
    <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden group ${isActive ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
        <div className={`absolute inset-0 bg-primary transition-transform duration-300 ${originClass} ${isActive ? activeScaleClass : inactiveScaleClass}`}></div>
        <div className={`absolute inset-0 bg-zinc-900 transition-transform duration-300 ${originClass} ${isActive ? inactiveScaleClass : (origin === 'left' || origin === 'right' ? 'scale-x-100' : 'scale-y-100')}`}></div>
        <span className="relative z-10 flex items-center justify-center gap-2">
            {icon}
            {label}
            {subLabel && <span className="opacity-60 font-normal">({subLabel})</span>}
        </span>
    </button>
  );
};
