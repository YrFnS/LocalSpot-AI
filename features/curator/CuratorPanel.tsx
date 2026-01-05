import React, { useState } from 'react';
import { Business, Itinerary } from '../../types';
import { generateItinerary } from '../../services/itineraryService';

interface CuratorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableBusinesses: Business[];
  onSelectBusiness: (id: string) => void;
}

export const CuratorPanel: React.FC<CuratorPanelProps> = ({ 
    isOpen, 
    onClose, 
    availableBusinesses,
    onSelectBusiness
}) => {
  const [prompt, setPrompt] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;
      
      setIsGenerating(true);
      const result = await generateItinerary(prompt, availableBusinesses);
      setItinerary(result);
      setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <h2 className="text-sm font-mono font-bold tracking-widest text-zinc-100">THE CURATOR</h2>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </div>

        {/* Input Area */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/20">
            <form onSubmit={handleGenerate} className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Design your experience</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. 'Chill date night with jazz'..."
                        className="w-full bg-black/40 border border-zinc-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none placeholder:text-zinc-600"
                    />
                    <button 
                        type="submit"
                        disabled={isGenerating || !prompt}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold disabled:opacity-50 disabled:bg-zinc-800 transition-colors"
                    >
                        {isGenerating ? '...' : 'GO'}
                    </button>
                </div>
            </form>
        </div>

        {/* Timeline Results */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {!itinerary && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 opacity-60">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    <p className="text-xs font-mono text-center max-w-[200px]">
                        Let AI architect your perfect outing based on local signals.
                    </p>
                </div>
            )}

            {isGenerating && (
                <div className="space-y-4 animate-pulse">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-12 flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-zinc-800 mb-2"></div>
                                <div className="w-0.5 flex-1 bg-zinc-800"></div>
                            </div>
                            <div className="flex-1 h-24 bg-zinc-900 rounded border border-zinc-800"></div>
                        </div>
                    ))}
                </div>
            )}

            {itinerary && (
                <div className="space-y-6">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-white leading-tight">{itinerary.title}</h1>
                        <span className="text-xs font-mono text-purple-400">Est. Cost: {itinerary.totalCostEstimate}</span>
                    </div>

                    <div className="relative">
                        {itinerary.items.map((item, index) => (
                            <div key={item.id} className="flex gap-4 relative group">
                                {/* Timeline Line */}
                                <div className="flex flex-col items-center w-12 shrink-0">
                                    <span className="text-[10px] font-mono text-zinc-500 mb-1">{item.timeOffset}</span>
                                    <div className={`w-3 h-3 rounded-full border-2 ${getTypeColor(item.type)} bg-zinc-950 z-10`}></div>
                                    {index !== itinerary.items.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-zinc-800 my-1 group-hover:bg-zinc-700 transition-colors"></div>
                                    )}
                                </div>

                                {/* Content Card */}
                                <div 
                                    onClick={() => item.businessId && onSelectBusiness(item.businessId)}
                                    className={`
                                        flex-1 mb-6 p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 
                                        transition-all duration-300 hover:bg-zinc-900 hover:border-zinc-700
                                        ${item.businessId ? 'cursor-pointer hover:shadow-lg hover:shadow-purple-500/10' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm ${item.businessId ? 'text-white' : 'text-zinc-300'}`}>
                                            {item.business?.name || item.title}
                                        </h3>
                                        <span className="text-[10px] font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-800">
                                            {item.type}
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                                        {item.description}
                                    </p>

                                    {item.business && (
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                                            <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                                                VIEW DETAILS →
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full py-3 mt-4 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white text-xs font-mono uppercase tracking-widest transition-all">
                        SAVE ITINERARY
                    </button>
                </div>
            )}
        </div>
    </div>
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