import React from 'react';
import { Business } from '../../types';

interface BusinessGridProps {
  businesses: Business[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export const BusinessGrid: React.FC<BusinessGridProps> = ({ businesses, onSelect, selectedId }) => {
  if (businesses.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
        No Signals Detected in this Sector
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8 bg-zinc-950/50">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {businesses.map((biz, idx) => {
          // Determine visual prominence based on index or rating
          const isProminent = (idx % 5 === 0) || (biz.rating && biz.rating > 4.8);
          
          return (
            <div
              key={biz.id}
              onClick={() => onSelect(biz.id)}
              className={`
                break-inside-avoid relative group overflow-hidden rounded-lg cursor-pointer
                border border-zinc-800 bg-zinc-900 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10
                ${selectedId === biz.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-950' : ''}
              `}
            >
              {/* Image Layer */}
              <div className={`relative w-full overflow-hidden ${isProminent ? 'aspect-[4/5]' : 'aspect-square'}`}>
                {biz.photos?.[0] ? (
                  <img
                    src={biz.photos[0].name}
                    alt={biz.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-[0.8] contrast-125 grayscale-[0.3] group-hover:grayscale-0"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="font-mono text-xs text-zinc-600">NO VISUAL</span>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                
                {/* Verified Badge */}
                {biz.verified && (
                  <div className="absolute top-3 right-3 z-10 bg-blue-500/20 backdrop-blur border border-blue-500/50 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Verified
                  </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
                     <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 rounded uppercase">
                       {biz.types?.[0] || 'Place'}
                     </span>
                     {biz.priceLevel && (
                        <span className="text-[10px] font-mono text-zinc-300">{biz.priceLevel}</span>
                     )}
                  </div>
                  
                  <h3 className={`font-bold text-white leading-tight mb-1 ${isProminent ? 'text-2xl' : 'text-lg'}`}>
                    {biz.name}
                  </h3>
                  
                  <div className="flex justify-between items-end">
                     {biz.vibe ? (
                       <p className="text-xs text-zinc-400 font-serif italic line-clamp-1 border-l-2 border-primary/50 pl-2">
                         "{biz.vibe}"
                       </p>
                     ) : (
                       <div />
                     )}
                     {biz.rating && (
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-xs font-bold text-white">{biz.rating.toFixed(1)}</span>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Score</span>
                        </div>
                     )}
                  </div>
                </div>
              </div>
              
              {/* Hover Reveal Details */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center pointer-events-none md:pointer-events-auto">
                  <span className="text-primary text-xs font-mono tracking-widest mb-2 uppercase border-b border-primary/30 pb-1">Quick Scan</span>
                  <p className="text-sm text-zinc-200 line-clamp-4 font-light leading-relaxed mb-4">
                      {biz.description}
                  </p>
                  <button className="px-4 py-2 border border-white/20 hover:border-white text-xs font-mono text-white uppercase tracking-wider transition-colors bg-white/5">
                      Explore Dossier
                  </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
              End of Visual Stream
          </p>
      </div>
    </div>
  );
};