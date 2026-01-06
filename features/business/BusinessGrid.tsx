
import React from 'react';
import { Business } from '../../types';

interface BusinessGridProps {
  businesses: Business[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  onHover: (id: string | null) => void;
}

const ScanLoader = () => (
    <div className="h-full w-full p-4 md:p-8 bg-zinc-950/50 overflow-hidden relative">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="break-inside-avoid relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 aspect-[4/5]">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] w-full animate-[spin_4s_linear_infinite] translate-y-[-50%]"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                        <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse"></div>
                        <div className="h-3 bg-zinc-800/50 rounded w-1/3 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="px-4 py-2 bg-black/80 backdrop-blur border border-primary/30 text-primary font-mono text-xs tracking-widest animate-pulse">
                SCANNING SECTOR...
            </div>
        </div>
    </div>
);

export const BusinessGrid: React.FC<BusinessGridProps> = ({ businesses, onSelect, selectedId, onHover }) => {
  // We don't have an explicit 'isLoading' prop passed here currently, 
  // but if the list is empty and we are technically searching, the parent handles it.
  // However, if we just have 0 results after search:
  if (businesses.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col gap-4 bg-[#050505]">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border border-zinc-800 rounded-full animate-[ping_3s_ease-out_infinite]"></div>
            <div className="absolute inset-4 border border-zinc-800 rounded-full animate-[ping_3s_ease-out_infinite_1s]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>
        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">
             No Signals Detected
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8 bg-[#050505] custom-scrollbar">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {businesses.map((biz, idx) => {
          // Determine visual prominence based on index or rating
          const isProminent = (idx % 5 === 0) || (biz.rating && biz.rating > 4.8);
          
          return (
            <div
              key={biz.id}
              onClick={() => onSelect(biz.id)}
              onMouseEnter={() => onHover(biz.id)}
              onMouseLeave={() => onHover(null)}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`
                break-inside-avoid relative group overflow-hidden rounded-sm cursor-pointer
                border border-zinc-800 bg-zinc-900 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
                ${selectedId === biz.id ? 'ring-1 ring-primary' : 'hover:border-zinc-600'}
              `}
            >
              {/* Image Layer */}
              <div className={`relative w-full overflow-hidden ${isProminent ? 'aspect-[4/5]' : 'aspect-square'}`}>
                {biz.photos?.[0] ? (
                  <img
                    src={biz.photos[0].name}
                    alt={biz.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-[0.7] contrast-[1.1] grayscale-[0.2] group-hover:grayscale-0 group-hover:brightness-100"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                    <span className="font-mono text-[10px] text-zinc-700 tracking-widest border border-zinc-800 px-2 py-1">NO VISUAL</span>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 transition-opacity" />
                
                {/* Verified Badge */}
                {biz.verified && (
                  <div className="absolute top-2 right-2 z-10 bg-blue-500/10 backdrop-blur border border-blue-500/30 text-blue-300 text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider">
                    VERIFIED
                  </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
                     <span className="text-[9px] font-mono text-primary bg-primary/10 px-1 rounded-sm uppercase tracking-wider border border-primary/20">
                       {biz.types?.[0] || 'Entity'}
                     </span>
                  </div>
                  
                  <h3 className={`font-bold text-white leading-none mb-1 tracking-tight ${isProminent ? 'text-2xl' : 'text-lg'}`}>
                    {biz.name}
                  </h3>
                  
                  <div className="flex justify-between items-end mt-1">
                     <div className="flex-1">
                         {biz.vibe ? (
                           <p className="text-[10px] text-zinc-400 font-mono line-clamp-1 border-l border-primary/50 pl-2">
                             {biz.vibe}
                           </p>
                         ) : <div />}
                     </div>
                     {biz.rating && (
                        <div className="flex flex-col items-end shrink-0 pl-2">
                            <span className="font-mono text-sm font-bold text-white leading-none">{biz.rating.toFixed(1)}</span>
                            <div className="flex gap-[1px] mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-[2px] h-[2px] rounded-full ${i < Math.round(biz.rating!) ? 'bg-primary' : 'bg-zinc-800'}`} />
                                ))}
                            </div>
                        </div>
                     )}
                  </div>
                </div>
              </div>
              
              {/* Hover Reveal Details */}
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center items-center p-6 text-center pointer-events-none md:pointer-events-auto border-[0.5px] border-white/10 m-1">
                  <span className="text-primary text-[9px] font-mono tracking-[0.3em] mb-4 uppercase">Data Uplink</span>
                  <p className="text-xs text-zinc-300 line-clamp-4 font-light leading-relaxed mb-6 font-mono">
                      {biz.description}
                  </p>
                  <button className="px-4 py-2 border border-zinc-600 hover:border-white text-[10px] font-mono text-white uppercase tracking-widest transition-colors bg-white/5 hover:bg-white/10">
                      Access Dossier
                  </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                End of Stream
            </p>
          </div>
      </div>
    </div>
  );
};
