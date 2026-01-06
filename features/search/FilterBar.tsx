
import React, { useState } from 'react';
import { FilterState, SortOption } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const [activePanel, setActivePanel] = useState<'RATING' | 'SORT' | null>(null);

  const togglePrice = (price: string) => {
    const current = filters.priceLevels;
    const next = current.includes(price) 
      ? current.filter(p => p !== price)
      : [...current, price];
    onChange({ ...filters, priceLevels: next });
  };

  const ratings = [3.5, 4.0, 4.5];
  
  return (
    <div className="w-full border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-md z-30 relative py-2 px-4 flex items-center gap-4 overflow-x-auto scrollbar-hide">
       
       {/* Price Toggles */}
       <div className="flex items-center gap-px bg-zinc-800 border border-zinc-800 rounded-sm overflow-hidden shrink-0">
          {['$', '$$', '$$$'].map(price => (
             <button
                key={price}
                onClick={() => togglePrice(price)}
                className={`
                   px-3 py-1 text-[10px] font-mono font-bold transition-all min-w-[32px]
                   ${filters.priceLevels.includes(price) 
                     ? 'bg-zinc-200 text-black' 
                     : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}
                `}
             >
                {price}
             </button>
          ))}
       </div>

       <div className="w-px h-6 bg-zinc-800 shrink-0"></div>

       {/* Open Now Switch */}
       <button
          onClick={() => onChange({ ...filters, onlyOpen: !filters.onlyOpen })}
          className={`
             flex items-center gap-2 px-3 py-1 rounded-sm border transition-all text-[10px] font-mono tracking-wider shrink-0
             ${filters.onlyOpen 
               ? 'bg-green-900/20 border-green-800 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.1)]' 
               : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
          `}
       >
          <div className={`w-1.5 h-1.5 rounded-sm transition-colors ${filters.onlyOpen ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`}></div>
          OPEN_NOW
       </button>

       {/* Rating Selector */}
       <div className="flex items-center gap-2 shrink-0">
           <span className="text-[9px] font-mono text-zinc-600 uppercase">MIN_RAT:</span>
           <div className="flex gap-1">
               {ratings.map(r => (
                   <button
                        key={r}
                        onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
                        className={`
                            w-8 h-6 flex items-center justify-center border text-[9px] font-mono rounded-sm transition-all
                            ${filters.minRating === r 
                                ? 'bg-primary/20 border-primary text-primary font-bold' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                        `}
                   >
                       {r}
                   </button>
               ))}
           </div>
       </div>

       <div className="flex-1"></div>

       {/* Sorting */}
       <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-mono text-zinc-600 uppercase hidden sm:inline">SORT_SEQ:</span>
            <div className="flex bg-zinc-900 rounded-sm border border-zinc-800 p-0.5">
                {[SortOption.RELEVANCE, SortOption.RATING, SortOption.DISTANCE].map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange({ ...filters, sortBy: opt })}
                        className={`
                            px-2 py-1 text-[9px] font-mono uppercase rounded-sm transition-all
                            ${filters.sortBy === opt ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}
                        `}
                    >
                        {opt === SortOption.RELEVANCE ? 'REL' : (opt === SortOption.RATING ? 'RAT' : 'DIST')}
                    </button>
                ))}
            </div>
       </div>

       {/* Reset */}
       {(filters.minRating > 0 || filters.priceLevels.length > 0 || filters.onlyOpen || filters.sortBy !== SortOption.RELEVANCE) && (
           <button 
             onClick={() => onChange({ minRating: 0, priceLevels: [], onlyOpen: false, sortBy: SortOption.RELEVANCE })}
             className="ml-2 w-6 h-6 flex items-center justify-center bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/40 rounded-sm transition-colors shrink-0"
             title="RESET PARAMETERS"
           >
             ✕
           </button>
       )}
    </div>
  );
};
