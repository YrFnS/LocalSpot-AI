import React, { useState } from 'react';
import { FilterState } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  
  const togglePrice = (price: string) => {
    const current = filters.priceLevels;
    const next = current.includes(price) 
      ? current.filter(p => p !== price)
      : [...current, price];
    onChange({ ...filters, priceLevels: next });
  };

  const ratings = [
      { value: 0, label: 'ANY' },
      { value: 3.5, label: '3.5+' },
      { value: 4.0, label: '4.0+' },
      { value: 4.5, label: '4.5+' },
  ];

  const currentRatingLabel = ratings.find(r => r.value === filters.minRating)?.label || 'ANY';

  return (
    <div className="flex flex-wrap gap-2 py-2 px-4 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-sm z-30 relative">
       {/* Rating Filter - Custom Dropdown */}
       <div className="relative">
           <button 
                onClick={() => setIsRatingOpen(!isRatingOpen)}
                className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono hover:border-zinc-600 transition-colors h-[26px]"
           >
              <span className="text-zinc-500 mr-2">MIN RATING</span>
              <span className="text-white min-w-[24px] text-left">{currentRatingLabel}</span>
              <svg 
                className={`ml-1 w-3 h-3 text-zinc-500 transition-transform duration-200 ${isRatingOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
           </button>
           
           {isRatingOpen && (
               <>
               <div className="fixed inset-0 z-10" onClick={() => setIsRatingOpen(false)} />
               <div className="absolute top-full left-0 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                   {ratings.map(r => (
                       <button
                           key={r.value}
                           onClick={() => {
                               onChange({ ...filters, minRating: r.value });
                               setIsRatingOpen(false);
                           }}
                           className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-zinc-800 transition-colors flex justify-between items-center ${filters.minRating === r.value ? 'text-primary bg-zinc-800/50' : 'text-zinc-300'}`}
                       >
                           {r.label}
                           {filters.minRating === r.value && <span className="text-primary">•</span>}
                       </button>
                   ))}
               </div>
               </>
           )}
       </div>

       {/* Price Filter */}
       <div className="flex items-center gap-1">
          {['$', '$$', '$$$'].map(price => (
             <button
                key={price}
                onClick={() => togglePrice(price)}
                className={`
                   px-2 py-1 rounded border text-xs font-mono transition-all h-[26px] flex items-center
                   ${filters.priceLevels.includes(price) 
                     ? 'bg-zinc-100 text-black border-zinc-100' 
                     : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}
                `}
             >
                {price}
             </button>
          ))}
       </div>

       {/* Open Now Toggle */}
       <button
          onClick={() => onChange({ ...filters, onlyOpen: !filters.onlyOpen })}
          className={`
             px-3 py-1 rounded border text-xs font-mono transition-all flex items-center gap-2 h-[26px]
             ${filters.onlyOpen 
               ? 'bg-green-900/30 text-green-400 border-green-800' 
               : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}
          `}
       >
          <span className={`w-1.5 h-1.5 rounded-full ${filters.onlyOpen ? 'bg-green-400' : 'bg-zinc-600'}`} />
          OPEN NOW
       </button>
       
       {(filters.minRating > 0 || filters.priceLevels.length > 0 || filters.onlyOpen) && (
           <button 
             onClick={() => onChange({ minRating: 0, priceLevels: [], onlyOpen: false })}
             className="ml-auto text-[10px] text-red-400 hover:text-red-300 font-mono underline decoration-dotted"
           >
             RESET
           </button>
       )}
    </div>
  );
};