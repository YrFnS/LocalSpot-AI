
import React from 'react';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
  isSelected: boolean;
  onSpeak: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (b: Business) => void;
  onHover: (id: string | null) => void;
  
  // New props for Comparison
  isInComparison?: boolean;
  onToggleComparison?: (b: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ 
    business, 
    onClick, 
    isSelected, 
    onSpeak,
    isFavorite,
    onToggleFavorite,
    onHover,
    isInComparison,
    onToggleComparison
}) => {
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => onHover(business.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        relative group border-b border-zinc-900/50 cursor-pointer overflow-hidden transition-all duration-300
        ${isSelected ? 'bg-zinc-900 border-l-2 border-l-primary' : 'hover:bg-zinc-900/30 border-l-2 border-l-transparent hover:border-l-zinc-700'}
      `}
    >
      {/* Background Hover Effect */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 group-hover:opacity-5 transition-opacity"></div>

      <div className="flex h-32">
        {/* Left: Image Strip */}
        <div className="w-24 md:w-32 relative shrink-0 border-r border-zinc-900">
            {business.photos?.[0] ? (
                <img 
                    src={business.photos[0].name} 
                    alt={business.name}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 brightness-75 group-hover:brightness-100"
                />
            ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-zinc-700 -rotate-90 whitespace-nowrap">NO VISUAL</span>
                </div>
            )}
            
            {/* Overlay Rating */}
            <div className="absolute top-0 left-0 bg-black/80 backdrop-blur px-2 py-1 border-b border-r border-zinc-800">
                <span className={`font-mono text-xs font-bold ${business.rating && business.rating >= 4.5 ? 'text-primary' : 'text-white'}`}>
                    {business.rating ? business.rating.toFixed(1) : 'N/A'}
                </span>
            </div>
            
            {business.verified && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-900/80 backdrop-blur py-0.5 text-center">
                    <span className="text-[8px] font-mono text-blue-200 uppercase tracking-wider">VERIFIED</span>
                </div>
            )}
        </div>

        {/* Right: Data Block */}
        <div className="flex-1 p-3 flex flex-col justify-between relative">
            <div>
                <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm md:text-base leading-tight tracking-tight ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                        {business.name}
                    </h3>
                    <div className="flex gap-1">
                        {business.priceLevel && (
                             <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1 border border-zinc-800">{business.priceLevel}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-primary transition-colors"></span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider group-hover:text-primary transition-colors">
                        {business.types?.[0] || 'ENTITY'}
                    </span>
                    {business.distanceMeters && (
                        <span className="text-[10px] font-mono text-zinc-600">
                             // { (business.distanceMeters / 1000).toFixed(1) }KM
                        </span>
                    )}
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-light font-sans max-w-[90%] group-hover:text-zinc-300">
                    {business.description || "No signal data available for this entity."}
                </p>
            </div>

            {/* Hidden Action Rail (Slides up/in on hover) */}
            <div className="flex items-center justify-end gap-2 mt-2 opacity-60 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <button 
                    onClick={(e) => { e.stopPropagation(); onSpeak(business.description || business.name); }}
                    className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                    title="Audio Brief"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                
                {onToggleComparison && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleComparison(business); }}
                        className={`p-1.5 hover:bg-zinc-800 rounded transition-colors ${isInComparison ? 'text-primary' : 'text-zinc-500 hover:text-white'}`}
                        title="Compare"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18"/><path d="M3 12h18"/></svg>
                    </button>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(business); }}
                    className={`p-1.5 hover:bg-zinc-800 rounded transition-colors ${isFavorite ? 'text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            </div>
            
            {/* Decorative Corner */}
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-800 group-hover:border-primary/50 transition-colors"></div>
        </div>
      </div>
    </div>
  );
};
