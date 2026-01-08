
import React, { useRef, useState, useCallback } from 'react';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
  isSelected: boolean;
  onSpeak: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (b: Business) => void;
  onHover: (id: string | null) => void;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  // 3D Tilt Logic
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const rotateY = ((mouseX - width / 2) / width) * 10; // Max 10 deg rotation
      const rotateX = ((mouseY - height / 2) / height) * -10;

      setRotate({ x: rotateX, y: rotateY });
      setOpacity(1);
      
      onHover(business.id);
  }, [business.id, onHover]);

  const handleMouseLeave = useCallback(() => {
      setRotate({ x: 0, y: 0 });
      setOpacity(0);
      onHover(null);
  }, [onHover]);

  // Color coding
  const score = business.matchScore || 0;
  let matchColor = 'text-zinc-500';
  let matchBorder = 'border-zinc-800';
  if (score >= 90) { matchColor = 'text-primary'; matchBorder = 'border-primary'; }
  else if (score >= 75) { matchColor = 'text-green-500'; matchBorder = 'border-green-500'; }
  else if (score >= 50) { matchColor = 'text-yellow-500'; matchBorder = 'border-yellow-500'; }

  const crowd = business.crowdLevel || 0;
  let crowdColor = 'bg-green-500';
  let crowdLabel = 'LOW';
  if (crowd > 80) { crowdColor = 'bg-red-500'; crowdLabel = 'CRIT'; }
  else if (crowd > 50) { crowdColor = 'bg-yellow-500'; crowdLabel = 'MED'; }

  return (
    <div className="perspective-[1000px] mb-4">
        <div 
          ref={cardRef}
          onClick={onClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`
            relative group cursor-pointer h-36 w-full shrink-0 transition-all duration-200 ease-out
            ${isSelected ? 'z-10' : 'z-0'}
          `}
          style={{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isSelected ? 1.02 : 1})`,
              transformStyle: 'preserve-3d',
          }}
        >
          {/* Card Content Container */}
          <div className={`
                absolute inset-0 flex overflow-hidden backface-hidden
                ${isSelected 
                    ? 'bg-zinc-900 border-l-4 border-l-primary border-y border-r border-zinc-700 shadow-2xl shadow-primary/10' 
                    : 'bg-black border-l-4 border-l-zinc-800 border-y border-r border-transparent hover:border-zinc-700 hover:bg-zinc-900'}
          `}>
              
              {/* Specular Reflection Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent mix-blend-overlay transition-opacity duration-200"
                style={{ opacity: opacity }}
              />

              {/* Left: Image Data Block */}
              <div className="w-24 md:w-32 relative shrink-0 border-r border-zinc-800">
                    {business.photos?.[0] ? (
                        <div className="w-full h-full relative overflow-hidden">
                            <img 
                                src={business.photos[0].name} 
                                alt={business.name}
                                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 brightness-75 group-hover:brightness-100"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
                            
                            <div className="absolute bottom-1 left-1 right-1 h-1 bg-black/50 overflow-hidden rounded-full">
                                <div className={`h-full ${crowdColor}`} style={{ width: `${crowd}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center">
                            <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-[8px] font-mono text-zinc-700 mt-2">NO_VISUAL</span>
                        </div>
                    )}
                    
                    <div className="absolute top-0 left-0 right-0 bg-black/80 p-1 flex justify-between items-center border-b border-zinc-800/50">
                        <span className={`font-mono text-[9px] font-bold ${business.rating && business.rating >= 4.5 ? 'text-primary' : 'text-zinc-400'}`}>
                            {business.rating?.toFixed(1) || '--'}
                        </span>
                        <div className="flex gap-0.5 items-end h-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-1 ${business.rating && business.rating >= i ? 'bg-primary' : 'bg-zinc-700'} ${i === 1 ? 'h-1' : (i===2 ? 'h-1.5' : 'h-2')}`}></div>
                            ))}
                        </div>
                    </div>
              </div>

              {/* Right: Info Matrix */}
              <div className="flex-1 p-3 pl-4 flex flex-col justify-between relative z-10">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold text-sm md:text-base leading-none tracking-tight uppercase ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                                {business.name}
                            </h3>
                            
                            {score > 0 && (
                                <div className={`flex items-center gap-1.5 border px-1.5 py-0.5 rounded-sm ${matchBorder} bg-black/50`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${matchColor.replace('text', 'bg')} animate-pulse`}></div>
                                    <span className={`text-[8px] font-mono font-bold ${matchColor}`}>
                                        {score}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 mb-2">
                            <span className="text-[9px] font-mono text-primary bg-primary/10 px-1 border border-primary/20 uppercase">
                                {business.types?.[0] || 'ENTITY'}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${crowdColor}`}></span>
                                {crowdLabel}
                            </span>
                            {business.priceLevel && (
                                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-1.5 border border-zinc-800">{business.priceLevel}</span>
                            )}
                        </div>

                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed font-mono opacity-80 border-l-2 border-zinc-800 pl-2">
                            {business.description || ">> Awaiting signal decryption..."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-1 border-t border-zinc-900/50 pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                            {business.openNow !== undefined && (
                                <span className={`text-[8px] font-mono uppercase tracking-wider ${business.openNow ? 'text-green-500' : 'text-red-500'}`}>
                                    [{business.openNow ? 'ONLINE' : 'OFFLINE'}]
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onSpeak(business.description || business.name); }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded-sm text-zinc-500 hover:text-white transition-colors"
                                title="Audio Log"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            </button>
                            
                            {onToggleComparison && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleComparison && onToggleComparison(business); }}
                                    className={`w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded-sm transition-colors ${isInComparison ? 'text-primary bg-primary/10' : 'text-zinc-500 hover:text-white'}`}
                                    title="Add to Compare Deck"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18"/><path d="M3 12h18"/></svg>
                                </button>
                            )}

                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite(business); }}
                                className={`w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded-sm transition-colors ${isFavorite ? 'text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                                title="Archive"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            </button>
                        </div>
                    </div>
              </div>
          </div>
        </div>
    </div>
  );
};
