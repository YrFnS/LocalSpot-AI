
import React, { useState, useEffect } from 'react';
import { Business, Itinerary } from '../../types';
import { generateItinerary } from '../../services/itineraryService';

interface CuratorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableBusinesses: Business[];
  onSelectBusiness: (id: string) => void;
}

const QUICK_VIBES = [
    "Romantic Dinner & Drinks",
    "Hidden Gems Crawl",
    "Art & Coffee Afternoon", 
    "Late Night Chaos"
];

export const CuratorPanel: React.FC<CuratorPanelProps> = ({ 
    isOpen, 
    onClose, 
    availableBusinesses,
    onSelectBusiness
}) => {
  const [prompt, setPrompt] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Simulated loading steps for effect
  useEffect(() => {
    if (isGenerating) {
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % 4);
        }, 800);
        return () => clearInterval(interval);
    } else {
        setLoadingStep(0);
    }
  }, [isGenerating]);

  const handleGenerate = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!prompt.trim()) return;
      
      setIsGenerating(true);
      setItinerary(null); // Clear previous
      const result = await generateItinerary(prompt, availableBusinesses);
      setItinerary(result);
      setIsGenerating(false);
  };

  const handleQuickSelect = (vibe: string) => {
      setPrompt(vibe);
      // Optional: Auto-submit could go here
  };

  if (!isOpen) return null;

  return (
    <>
        {/* Backdrop */}
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-[90] animate-in fade-in duration-300" 
            onClick={onClose}
        />

        {/* Panel */}
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#09090b] border-l border-zinc-800 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-purple-500/10 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M12 12 2.1 10.5"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.2em] text-white font-mono uppercase">The Curator</h2>
                        <div className="text-[9px] text-purple-400 font-mono tracking-widest opacity-80">AI LIFESTYLE ARCHITECT</div>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>

            {/* Input Console */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/20 space-y-5 relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                        Directive Input
                    </label>
                    <form onSubmit={handleGenerate} className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                        
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your ideal outing..."
                            className="relative w-full bg-[#050505] border border-zinc-800 rounded-lg py-4 pl-4 pr-32 text-sm text-white focus:border-purple-500/50 outline-none placeholder:text-zinc-700 font-mono transition-colors shadow-inner"
                        />
                        <button 
                            type="submit"
                            disabled={isGenerating || !prompt}
                            className={`
                                absolute right-2 top-2 bottom-2 px-4 rounded text-[10px] font-bold font-mono uppercase transition-all duration-300
                                ${isGenerating 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-wait' 
                                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]'}
                                disabled:opacity-50 disabled:bg-zinc-800 disabled:shadow-none
                            `}
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-1">
                                    <span className="animate-spin">⟳</span> PROC
                                </span>
                            ) : 'GENERATE'}
                        </button>
                    </form>
                </div>

                {/* Quick Chips */}
                {!isGenerating && !itinerary && (
                    <div className="space-y-3 pt-2">
                        <label className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Quick Presets</label>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_VIBES.map((vibe, i) => (
                                <button
                                    key={vibe}
                                    onClick={() => handleQuickSelect(vibe)}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                    className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 hover:border-purple-500/30 hover:text-purple-300 text-zinc-400 text-[10px] rounded transition-all font-mono animate-in fade-in slide-in-from-bottom-1"
                                >
                                    {vibe}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Output Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-black/20">
                
                {/* Empty State */}
                {!itinerary && !isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 space-y-6 opacity-60 pointer-events-none">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full"></div>
                            <div className="w-20 h-20 border border-zinc-800 rounded-full flex items-center justify-center relative bg-black/50 backdrop-blur-sm">
                                <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                {/* Orbiting Dot */}
                                <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xs font-mono text-zinc-400 tracking-[0.2em] uppercase">System Standby</p>
                            <p className="text-[10px] text-zinc-600 max-w-[220px] mx-auto leading-relaxed">
                                Awaiting user parameters to construct optimal trajectory based on local signals.
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isGenerating && (
                    <div className="p-8 space-y-8 flex flex-col items-center justify-center h-full">
                        <div className="w-full max-w-[200px] space-y-4">
                            {/* Progress Bar */}
                            <div className="h-1 w-full bg-zinc-900 rounded overflow-hidden">
                                <div className="h-full bg-purple-500 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
                            </div>
                            
                            {/* Terminal Text */}
                            <div className="font-mono text-[10px] text-purple-400 space-y-1">
                                <p className={loadingStep >= 0 ? 'opacity-100' : 'opacity-30'}>{'>'} ANALYZING LOCAL SIGNALS...</p>
                                <p className={loadingStep >= 1 ? 'opacity-100' : 'opacity-30'}>{'>'} CALCULATING TRAJECTORY...</p>
                                <p className={loadingStep >= 2 ? 'opacity-100' : 'opacity-30'}>{'>'} OPTIMIZING FOR VIBE...</p>
                                <p className={loadingStep >= 3 ? 'opacity-100' : 'opacity-30'}>{'>'} FINALIZING ITINERARY...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Itinerary Results */}
                {itinerary && (
                    <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        {/* Title Card */}
                        <div className="relative p-6 border border-zinc-800 bg-zinc-900/30 rounded-lg overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <h1 className="text-xl font-bold text-white leading-tight tracking-tight mb-3 relative z-10">{itinerary.title}</h1>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 relative z-10">
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                                    COST <span className="text-white">{itinerary.totalCostEstimate}</span>
                                </span>
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                                    STOPS <span className="text-white">{itinerary.items.length}</span>
                                </span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-2">
                            {/* Connecting Line */}
                            <div className="absolute left-[27px] top-4 bottom-12 w-px bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-900"></div>

                            {itinerary.items.map((item, index) => (
                                <div key={item.id} className="flex gap-6 relative group mb-8 last:mb-0">
                                    {/* Time Marker */}
                                    <div className="flex flex-col items-center w-14 shrink-0 pt-1 relative z-10">
                                        <div className={`
                                            w-3 h-3 rounded-full border-2 bg-black transition-all duration-300
                                            ${getTypeColor(item.type)}
                                            group-hover:scale-125 group-hover:bg-purple-500 group-hover:border-purple-300
                                        `}></div>
                                        <span className="mt-2 text-[9px] font-mono text-zinc-500 bg-[#09090b] px-1">{item.timeOffset}</span>
                                    </div>

                                    {/* Content Card */}
                                    <div 
                                        onClick={() => item.businessId && onSelectBusiness(item.businessId)}
                                        className={`
                                            flex-1 p-4 rounded-lg border border-zinc-800 bg-zinc-900/20 relative overflow-hidden
                                            transition-all duration-300 group-hover:bg-zinc-900 group-hover:border-zinc-700 group-hover:shadow-lg
                                            ${item.businessId ? 'cursor-pointer' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-bold text-sm ${item.businessId ? 'text-white underline decoration-zinc-700 decoration-dotted underline-offset-4 group-hover:decoration-purple-500' : 'text-zinc-300'}`}>
                                                {item.business?.name || item.title}
                                            </h3>
                                            {item.businessId && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600 group-hover:text-purple-400 transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                            )}
                                        </div>

                                        <p className="text-xs text-zinc-400 font-light leading-relaxed mb-3">
                                            {item.description}
                                        </p>
                                        
                                        <span className="inline-block text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-wider">
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Footer Action */}
                        <div className="pt-4 border-t border-zinc-800/50 sticky bottom-0 bg-[#09090b]/95 backdrop-blur py-4 -mx-6 px-6">
                             <button className="w-full py-3 bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-colors rounded-sm flex items-center justify-center gap-3">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                Save to Favorites
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
  );
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'FOOD': return 'border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
        case 'DRINK': return 'border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]';
        case 'ACTIVITY': return 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
        default: return 'border-zinc-500';
    }
};
