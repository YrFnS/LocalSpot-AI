import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearching }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            onSearch(transcript);
            setIsListening(false);
        };
        
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [onSearch]);

  const toggleVoice = () => {
      if (isListening) {
          recognitionRef.current?.stop();
      } else {
          setIsListening(true);
          recognitionRef.current?.start();
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
      <div className={`
        absolute -inset-0.5 rounded-none bg-gradient-to-r from-primary to-accent opacity-30 blur 
        transition duration-1000 group-hover:opacity-60 group-hover:duration-200
        ${isSearching ? 'animate-pulse' : ''}
      `}></div>
      <div className="relative flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-zinc-700">
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search local... (e.g. 'Cozy cafes nearby')"
            className="w-full bg-transparent text-white px-4 py-3 outline-none placeholder:text-zinc-600 font-mono text-sm"
        />
        
        <button
            type="button"
            onClick={toggleVoice}
            className={`p-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-white'}`}
            title="Voice Search"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
        </button>
        
        <button
            type="submit"
            className="px-6 py-3 bg-white text-black font-bold font-mono text-sm hover:bg-zinc-200 transition-colors"
        >
            GO
        </button>
      </div>
    </form>
  );
};
