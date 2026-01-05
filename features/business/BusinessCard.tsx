import React from 'react';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
  isSelected: boolean;
  onSpeak: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (b: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ 
    business, 
    onClick, 
    isSelected, 
    onSpeak,
    isFavorite,
    onToggleFavorite
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative group p-4 border-b border-zinc-800 transition-all duration-300 cursor-pointer
        ${isSelected ? 'bg-zinc-900/80 border-l-2 border-l-primary' : 'hover:bg-zinc-900/40 border-l-2 border-l-transparent'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2 pr-8">
            <h3 className={`font-sans font-bold text-base leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
            {business.name}
            </h3>
            {business.verified && (
                <span className="shrink-0 text-blue-400" title="Verified Business">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </span>
            )}
        </div>
        {business.rating && (
          <span className="shrink-0 font-mono text-[10px] text-black bg-primary px-1.5 py-0.5 rounded-sm font-bold">
            {business.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
            {business.types?.[0] || 'Local'}
        </span>
        {business.priceLevel && (
            <span className="text-zinc-600 text-[10px]">• {business.priceLevel}</span>
        )}
      </div>

      {business.description && (
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-3 font-light">
          {business.description}
        </p>
      )}

      <div className="flex gap-2 mt-2 items-center justify-between">
         <div className="flex gap-2">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onSpeak(business.description || `No description available for ${business.name}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors text-xs font-mono"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                LISTEN
            </button>
         </div>

         <button
            onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(business);
            }}
            className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-zinc-600 hover:text-red-400'}`}
         >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
         </button>
      </div>
    </div>
  );
};