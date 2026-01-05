import React from 'react';

const CATEGORIES = [
  { id: 'coffee', label: '☕ COFFEE', query: 'best distinct coffee shops for working' },
  { id: 'food', label: '🍽️ EAT', query: 'top rated local restaurants avoiding chains' },
  { id: 'drinks', label: '🍸 DRINKS', query: 'cool cocktail bars and speakeasies' },
  { id: 'parks', label: '🌳 OUTDOORS', query: 'scenic parks and hidden nature spots' },
  { id: 'art', label: '🎨 CULTURE', query: 'art galleries, museums, and street art' },
  { id: 'shop', label: '🛍️ VINTAGE', query: 'vintage shops and local boutiques' },
  { id: 'music', label: '🎵 MUSIC', query: 'live music venues and record stores' },
];

interface CategorySelectorProps {
  onSelect: (query: string) => void;
  disabled: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full relative group">
       <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
       <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
       
       <div className="flex gap-2 overflow-x-auto py-2 px-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
            <button
            key={cat.id}
            onClick={() => onSelect(cat.query)}
            disabled={disabled}
            className="
                flex-shrink-0 px-4 py-1.5 rounded-none 
                bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs font-mono tracking-wider
                hover:bg-primary hover:border-primary hover:text-black transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                whitespace-nowrap active:scale-95
            "
            >
            {cat.label}
            </button>
        ))}
       </div>
    </div>
  );
};