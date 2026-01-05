
import React from 'react';

const CATEGORIES = [
  { id: 'coffee', label: 'COFFEE', query: 'best distinct coffee shops for working' },
  { id: 'food', label: 'EAT', query: 'top rated local restaurants avoiding chains' },
  { id: 'drinks', label: 'DRINKS', query: 'cool cocktail bars and speakeasies' },
  { id: 'parks', label: 'OUTDOORS', query: 'scenic parks and hidden nature spots' },
  { id: 'art', label: 'CULTURE', query: 'art galleries, museums, and street art' },
  { id: 'shop', label: 'VINTAGE', query: 'vintage shops and local boutiques' },
  { id: 'music', label: 'MUSIC', query: 'live music venues and record stores' },
];

interface CategorySelectorProps {
  onSelect: (query: string) => void;
  disabled: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full relative group border-b border-zinc-800/50 bg-black/20 backdrop-blur-sm">
       <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
       <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
       
       <div className="flex gap-1 overflow-x-auto py-2 px-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
            <button
            key={cat.id}
            onClick={() => onSelect(cat.query)}
            disabled={disabled}
            className="
                flex-shrink-0 px-4 py-2 rounded-sm 
                bg-transparent text-zinc-400 text-[10px] font-mono tracking-[0.1em] font-bold
                hover:bg-zinc-800/80 hover:text-white transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                whitespace-nowrap active:scale-95 border border-transparent hover:border-zinc-700
                focus:outline-none focus:ring-1 focus:ring-zinc-700
            "
            >
            {cat.label}
            </button>
        ))}
       </div>
    </div>
  );
};
