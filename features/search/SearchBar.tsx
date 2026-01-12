
import React, { useState, useEffect, useRef } from 'react';
import { useTypewriter } from '../ui/useTypewriter';
import { useSpeechRecognition } from './useSpeechRecognition';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  suggestions: string[];
  onOpenVision?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearching, suggestions, onOpenVision }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);

  // Hook 1: Visual Effect
  const { displayedText, isDeleting } = useTypewriter(
    suggestions.length > 0 ? suggestions : ["Search local...", "Find coffee...", "Hidden gems..."],
    100, 
    50, 
    2000
  );

  // Hook 2: Voice Logic
  const { isListening, toggleListening, isSupported } = useSpeechRecognition((transcript) => {
      setQuery(transcript);
      onSearch(transcript);
      setShowSuggestions(false);
  });

  const placeholder = `Try "${displayedText}"${isDeleting ? '' : '|'}`;

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const filteredSuggestions = query
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  return (
    <form ref={wrapperRef} onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group z-50">
      <div className={`
        absolute -inset-[1px] rounded-sm bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-0 
        transition duration-500 group-hover:opacity-100 blur-sm
        ${isSearching ? 'animate-pulse opacity-100' : ''}
      `}></div>
      
      <div className="relative flex items-center bg-black/90 backdrop-blur-xl border border-zinc-800 focus-within:border-primary/50 transition-colors">
        <div className="pl-4 text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white px-3 py-3 outline-none placeholder:text-zinc-600 font-mono text-xs md:text-sm tracking-wide"
        />
        
        {/* Vision Lens Button */}
        <button
            type="button"
            onClick={onOpenVision}
            className="p-3 transition-colors text-zinc-500 hover:text-white hover:bg-zinc-900 border-l border-zinc-800"
            title="Gemini Lens"
        >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
        </button>

        {isSupported && (
            <button
                type="button"
                onClick={toggleListening}
                className={`p-3 transition-colors border-l border-zinc-800 hover:bg-zinc-900 ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-zinc-500 hover:text-white'}`}
                title="Voice Search"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
            </button>
        )}
        
        <button
            type="submit"
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-primary font-bold font-mono text-xs tracking-widest transition-colors border-l border-zinc-800 group-focus-within:bg-primary group-focus-within:text-black"
        >
            SCAN
        </button>
      </div>

      {/* Intelligent Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-100 overflow-hidden z-[60]">
          <div className="px-3 py-2 text-[9px] font-mono text-primary bg-primary/5 uppercase tracking-[0.2em] border-b border-primary/20 flex justify-between">
             <span>AI SUGGESTIONS</span>
             <span className="opacity-50">GEMINI-3-FLASH</span>
          </div>
          {filteredSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 text-xs font-mono text-zinc-300 hover:bg-zinc-900 hover:text-white hover:pl-6 transition-all border-b border-zinc-800/50 last:border-0 flex items-center gap-2 group"
            >
               <span className="text-zinc-700 group-hover:text-primary transition-colors">⟫</span>
               {suggestion}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};
