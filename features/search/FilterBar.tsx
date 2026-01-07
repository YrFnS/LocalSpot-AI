
import React from 'react';
import { FilterState, SortOption } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const togglePrice = (price: string) => {
    const current = filters.priceLevels;
    const next = current.includes(price) 
      ? current.filter(p => p !== price)
      : [...current, price];
    onChange({ ...filters, priceLevels: next });
  };

  const ratings = [3.5, 4.0, 4.5];
  
  return (
    <div className="w-full border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-md z-30 relative py-3 px-4 flex items-center gap-6 overflow-x-auto custom-scrollbar">
       
       {/* Price Control Group */}
       <div className="flex flex-col gap-1 shrink-0">
           <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">COST_GAIN</span>
           <div className="flex items-center bg-black border border-zinc-800 rounded-sm p-0.5">
              {['$', '$$', '$$$'].map(price => {
                 const isActive = filters.priceLevels.includes(price);
                 return (
                     <button
                        key={price}
                        onClick={() => togglePrice(price)}
                        className={`
                           relative w-8 h-6 text-[9px] font-mono font-bold transition-all flex items-center justify-center
                           ${isActive ? 'text-black' : 'text-zinc-600 hover:text-zinc-400'}
                        `}
                     >
                        {isActive && (
                            <div className="absolute inset-0 bg-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.5)] z-0"></div>
                        )}
                        <span className="relative z-10">{price}</span>
                     </button>
                 );
              })}
           </div>
       </div>

       {/* Open Now Toggle Switch */}
       <div className="flex flex-col gap-1 shrink-0">
           <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">STATUS_FILTER</span>
           <button
              onClick={() => onChange({ ...filters, onlyOpen: !filters.onlyOpen })}
              className={`
                 relative h-7 w-24 border rounded-full transition-all flex items-center px-1
                 ${filters.onlyOpen 
                   ? 'bg-green-900/20 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                   : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'}
              `}
           >
              <div className={`
                  w-5 h-5 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center
                  ${filters.onlyOpen ? 'translate-x-[calc(100%+2.5rem)] bg-green-500' : 'translate-x-0 bg-zinc-600'}
              `}>
                  {filters.onlyOpen && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
              </div>
              <span className={`absolute left-0 right-0 text-center text-[9px] font-mono font-bold transition-colors ${filters.onlyOpen ? 'text-green-400' : 'text-zinc-500'}`}>
                  {filters.onlyOpen ? 'OPEN_ONLY' : 'ALL_HOURS'}
              </span>
           </button>
       </div>

       {/* Rating Threshold Slider (Visual) */}
       <div className="flex flex-col gap-1 shrink-0">
           <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">MIN_SIGNAL</span>
           <div className="flex gap-0.5 items-end h-7 bg-black border border-zinc-800 px-1 py-1">
               {ratings.map((r, i) => {
                   const isActive = filters.minRating === r;
                   const isPast = filters.minRating >= r;
                   return (
                       <button
                            key={r}
                            onClick={() => onChange({ ...filters, minRating: isActive ? 0 : r })}
                            className={`
                                w-6 transition-all relative group
                                ${isActive ? 'h-full bg-primary shadow-[0_0_10px_rgba(249,115,22,0.6)]' : (isPast ? 'h-full bg-primary/40' : 'h-1/2 bg-zinc-800 hover:bg-zinc-700')}
                            `}
                       >
                           <div className="absolute bottom-full left-0 w-full text-[8px] font-mono text-primary opacity-0 group-hover:opacity-100 mb-1 pointer-events-none">
                               {r}
                           </div>
                       </button>
                   );
               })}
           </div>
       </div>

       <div className="w-px h-8 bg-zinc-800 shrink-0"></div>

       {/* Sorting Selector */}
       <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">SORT_SEQUENCE</span>
            <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 gap-0.5">
                {[SortOption.RELEVANCE, SortOption.RATING, SortOption.DISTANCE].map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange({ ...filters, sortBy: opt })}
                        className={`
                            px-3 py-1 text-[9px] font-mono uppercase transition-all
                            ${filters.sortBy === opt 
                                ? 'bg-zinc-700 text-white shadow-sm font-bold border-b-2 border-primary' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border-b-2 border-transparent'}
                        `}
                    >
                        {opt === SortOption.RELEVANCE ? 'REL' : (opt === SortOption.RATING ? 'RAT' : 'DIST')}
                    </button>
                ))}
            </div>
       </div>

       {/* Reset Button */}
       {(filters.minRating > 0 || filters.priceLevels.length > 0 || filters.onlyOpen || filters.sortBy !== SortOption.RELEVANCE) && (
           <button 
             onClick={() => onChange({ minRating: 0, priceLevels: [], onlyOpen: false, sortBy: SortOption.RELEVANCE })}
             className="ml-auto px-3 py-1 bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/50 hover:text-red-300 text-[9px] font-mono uppercase tracking-widest transition-all"
           >
             RESET_PARAMS
           </button>
       )}
    </div>
  );
};
