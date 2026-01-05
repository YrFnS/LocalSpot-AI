
import React, { useState } from 'react';
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

  const handleGenerate = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!prompt.trim()) return;
      
      setIsGenerating(true);
      const result = await generateItinerary(prompt, availableBusinesses);
      setItinerary(result);
      setIsGenerating(false);
  };

  const handleQuickSelect = (vibe: string) => {
      setPrompt(vibe);
      // Optional: Auto-submit or just fill
  };

  if (!isOpen) return null;

  return (
    <>
        {/* Backdrop */}
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in duration-300" 
            onClick={onClose}
        />

        {/* Panel */}
        <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#09090b] border-l border-zinc-800 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-purple-500/10 border border-purple-500/50 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M12 12 2.1 10.5"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-widest text-zinc-100 font-mono">THE CURATOR</h2>
                        <div className="text-[10px] text-purple-400 font-mono">AI LIFESTYLE ARCHITECT</div>
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
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/20 space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Directive Input</label>
                    <form onSubmit={handleGenerate} className="relative group">
                        <div className="absolute inset-0 bg-purple-500/20 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity rounded-lg"></div>
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your ideal outing..."
                            className="relative w-full bg-black border border-zinc-700 rounded-lg p-4 pr-24 text-sm text-white focus:border-purple-500 outline-none placeholder:text-zinc-700 font-mono transition-colors z-10"
                        />
                        <button 
                            type="submit"
                            disabled={isGenerating || !prompt}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-[10px] font-bold font-mono uppercase disabled:opacity-50 disabled:bg-zinc-800 transition-all z-20"
                        >
                            {isGenerating ? 'PROCESSING' : 'GENERATE'}
                        </button>
                    </form>
                </div>

                {/* Quick Chips */}
                {!isGenerating && !itinerary && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Quick Presets</label>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_VIBES.map(vibe => (
                                <button
                                    key={vibe}
                                    onClick={() => handleQuickSelect(vibe)}
                                    className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-purple-500/50 hover:text-purple-300 text-zinc-400 text-[10px] rounded transition-all font-mono"
                                >
                                    {vibe}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Output Area */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                {!itinerary && !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-6 opacity-80">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                            <svg className="w-16 h-16 text-zinc-700 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-xs font-mono text-zinc-400 tracking-widest">SYSTEM STANDBY</p>
                            <p className="text-[10px] text-zinc-600 max-w-[200px] mx-auto">
                                Awaiting user parameters to construct optimal trajectory.
                            </p>
                        </div>
                    </div>
                )}

                {isGenerating && (
                    <div className="space-y-6 pt-10">
                        <div className="flex items-center justify-center gap-3 text-purple-400 mb-8">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                        {[1,2,3].map(i => (
                            <div key={i} className="flex gap-4 animate-pulse opacity-50">
                                <div className="w-12 flex flex-col items-center pt-2">
                                    <div className="w-2 h-2 rounded-full bg-zinc-800 mb-2"></div>
                                    <div className="w-0.5 flex-1 bg-zinc-800"></div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                                    <div className="h-20 bg-zinc-900 rounded border border-zinc-800"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {itinerary && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="border-l-2 border-purple-500 pl-4 py-1">
                            <h1 className="text-xl font-bold text-white leading-none tracking-tight mb-2">{itinerary.title}</h1>
                            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                                <span>EST. COST: <span className="text-white">{itinerary.totalCostEstimate}</span></span>
                                <span>STOPS: <span className="text-white">{itinerary.items.length}</span></span>
                            </div>
                        </div>

                        <div className="relative">
                            {itinerary.items.map((item, index) => (
                                <div key={item.id} className="flex gap-4 relative group">
                                    {/* Timeline Graphics */}
                                    <div className="flex flex-col items-center w-12 shrink-0 pt-1">
                                        <span className="text-[10px] font-mono text-zinc-500 mb-2">{item.timeOffset}</span>
                                        <div className={`w-3 h-3 rounded-full border-2 ${getTypeColor(item.type)} bg-zinc-950 z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}></div>
                                        {index !== itinerary.items.length - 1 && (
                                            <div className="w-px flex-1 bg-gradient-to-b from-zinc-700 to-zinc-900 my-2 group-hover:from-purple-500 group-hover:to-purple-900 transition-colors"></div>
                                        )}
                                    </div>

                                    {/* Item Card */}
                                    <div 
                                        onClick={() => item.businessId && onSelectBusiness(item.businessId)}
                                        className={`
                                            flex-1 mb-8 p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 relative overflow-hidden
                                            transition-all duration-300 group-hover:bg-zinc-900 group-hover:border-zinc-700
                                            ${item.businessId ? 'cursor-pointer hover:shadow-lg hover:shadow-purple-500/10' : ''}
                                        `}
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                            {item.businessId && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>}
                                        </div>

                                        <div className="flex justify-between items-start mb-2 pr-4">
                                            <h3 className={`font-bold text-sm leading-tight ${item.businessId ? 'text-white underline decoration-zinc-700 underline-offset-4 decoration-dotted' : 'text-zinc-300'}`}>
                                                {item.business?.name || item.title}
                                            </h3>
                                        </div>
                                        
                                        <div className="flex gap-2 mb-3">
                                            <span className="text-[9px] font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-800 uppercase">
                                                {item.type}
                                            </span>
                                        </div>

                                        <p className="text-xs text-zinc-400 font-light leading-relaxed border-l border-zinc-700 pl-3">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-4 border-t border-zinc-800">
                             <button className="w-full py-3 bg-white text-black hover:bg-zinc-200 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                SAVE TO FAVORITES
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
        case 'FOOD': return 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
        case 'DRINK': return 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
        case 'ACTIVITY': return 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
        default: return 'border-zinc-500';
    }
};
