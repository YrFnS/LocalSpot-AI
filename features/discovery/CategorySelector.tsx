
import React from 'react';

const CATEGORIES = [
  { id: 'coffee', label: 'COFFEE', freq: '89.4', query: 'best distinct coffee shops for working' },
  { id: 'food', label: 'RATIONS', freq: '102.1', query: 'top rated local restaurants avoiding chains' },
  { id: 'drinks', label: 'LIQUIDS', freq: '94.3', query: 'cool cocktail bars and speakeasies' },
  { id: 'parks', label: 'TERRAIN', freq: '45.0', query: 'scenic parks and hidden nature spots' },
  { id: 'art', label: 'CULTURE', freq: '108.9', query: 'art galleries, museums, and street art' },
  { id: 'shop', label: 'SUPPLY', freq: '12.5', query: 'vintage shops and local boutiques' },
  { id: 'music', label: 'AUDIO', freq: '88.1', query: 'live music venues and record stores' },
];

interface CategorySelectorProps {
  onSelect: (query: string) => void;
  disabled: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full border-b border-zinc-800 bg-black/40 backdrop-blur-md relative overflow-hidden group">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 100%' }}></div>
       
       <div className="flex items-center overflow-x-auto scrollbar-hide py-3 px-2 gap-1 relative z-10">
        <div className="flex-shrink-0 px-3 flex flex-col justify-center border-r border-zinc-800 mr-2">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">BANDWIDTH</span>
            <span className="text-[10px] font-mono text-primary animate-pulse">HZ-20</span>
        </div>

        {CATEGORIES.map((cat, idx) => (
            <button
            key={cat.id}
            onClick={() => onSelect(cat.query)}
            disabled={disabled}
            className="
                flex-shrink-0 relative group/btn overflow-hidden
                px-4 py-2 border border-zinc-800/50 bg-zinc-900/20 rounded-sm
                hover:border-primary/50 hover:bg-zinc-900/80 transition-all duration-300
                disabled:opacity-30 disabled:cursor-not-allowed
                min-w-[100px] text-left
            "
            >
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-mono text-zinc-500 group-hover/btn:text-primary transition-colors">{cat.freq}</span>
                    <div className="w-1 h-1 bg-zinc-700 group-hover/btn:bg-primary rounded-full"></div>
                </div>
                <div className="text-xs font-bold font-mono text-zinc-300 group-hover/btn:text-white tracking-wider">
                    {cat.label}
                </div>
                
                {/* Hover line */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-primary w-0 group-hover/btn:w-full transition-all duration-300"></div>
                
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover/btn:border-primary/30 transition-all"></div>
            </button>
        ))}
        
        <div className="flex-shrink-0 w-8"></div> {/* Spacer */}
       </div>
       
       {/* Vignette */}
       <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
    </div>
  );
};
