
import React, { useState, useEffect } from 'react';
import { Business, Itinerary } from '../../types';
import { generateItinerary } from '../../services/itineraryService';

interface CuratorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableBusinesses: Business[];
  onSelectBusiness: (id: string) => void;
  onPlotCourse?: (itinerary: Itinerary) => void;
  onSaveMission?: (itinerary: Itinerary) => void;
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
    onSelectBusiness,
    onPlotCourse,
    onSaveMission
}) => {
  const [prompt, setPrompt] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

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

  // Reset saved state when new itinerary generated
  useEffect(() => {
      setIsSaved(false);
  }, [itinerary]);

  const handleGenerate = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!prompt.trim()) return;
      
      setIsGenerating(true);
      setItinerary(null); // Clear previous
      const result = await generateItinerary(prompt, availableBusinesses);
      setItinerary(result);
      setIsGenerating(false);
  };

  const handleSave = () => {
      if (itinerary && onSaveMission) {
          onSaveMission(itinerary);
          setIsSaved(true);
      }
  };

  const handleQuickSelect = (vibe: string) => {
      setPrompt(vibe);
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
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-purple-900/20 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.2em] text-white font-mono uppercase">MISSION PLANNER</h2>
                        <div className="text-[9px] text-purple-400 font-mono tracking-widest opacity-80">AI TRAJECTORY OPTIMIZER</div>
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
                        <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></span>
                        MISSION PARAMETERS
                    </label>
                    <form onSubmit={handleGenerate} className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                        
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter objective (e.g. 'Quiet date night')..."
                            className="relative w-full bg-[#050505] border border-zinc-800 rounded-sm py-4 pl-4 pr-32 text-sm text-white focus:border-purple-500/50 outline-none placeholder:text-zinc-700 font-mono transition-colors shadow-inner"
                        />
                        <button 
                            type="submit"
                            disabled={isGenerating || !prompt}
                            className={`
                                absolute right-2 top-2 bottom-2 px-4 rounded-sm text-[10px] font-bold font-mono uppercase transition-all duration-300
                                ${isGenerating 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-wait' 
                                    : 'bg-purple-900/50 hover:bg-purple-800 text-purple-200 border border-purple-500/30 hover:border-purple-400'}
                                disabled:opacity-50 disabled:bg-zinc-800
                            `}
                        >
                            {isGenerating ? 'CALC...' : 'EXECUTE'}
                        </button>
                    </form>
                </div>

                {/* Quick Chips */}
                {!isGenerating && !itinerary && (
                    <div className="space-y-3 pt-2">
                        <label className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">PRESET PROTOCOLS</label>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_VIBES.map((vibe, i) => (
                                <button
                                    key={vibe}
                                    onClick={() => handleQuickSelect(vibe)}
                                    className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 hover:border-purple-500/30 hover:text-purple-300 text-zinc-500 text-[10px] rounded-sm transition-all font-mono"
                                >
                                    [{vibe}]
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
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                        <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">AWAITING INPUT VECTOR</p>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                    </div>
                )}

                {/* Loading State */}
                {isGenerating && (
                    <div className="p-8 space-y-8 flex flex-col items-center justify-center h-full">
                        <div className="w-full max-w-[200px] space-y-4">
                            {/* Tactical Loader */}
                            <div className="flex justify-between items-center text-[9px] font-mono text-purple-400 mb-1">
                                <span>PROCESSING</span>
                                <span>{loadingStep * 25}%</span>
                            </div>
                            <div className="h-0.5 w-full bg-zinc-900 overflow-hidden">
                                <div className="h-full bg-purple-500 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
                            </div>
                            
                            {/* Terminal Text */}
                            <div className="font-mono text-[9px] text-zinc-500 space-y-1 mt-4">
                                <p className={loadingStep >= 0 ? 'text-purple-400' : 'opacity-20'}>{'>'} SCANNING_SECTOR_DATA...</p>
                                <p className={loadingStep >= 1 ? 'text-purple-400' : 'opacity-20'}>{'>'} TRIANGULATING_WAYPOINTS...</p>
                                <p className={loadingStep >= 2 ? 'text-purple-400' : 'opacity-20'}>{'>'} OPTIMIZING_ROUTE_EFFICIENCY...</p>
                                <p className={loadingStep >= 3 ? 'text-purple-400' : 'opacity-20'}>{'>'} COMPILING_MANIFEST...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Itinerary Results */}
                {itinerary && (
                    <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        {/* Title Card */}
                        <div className="relative p-6 border border-purple-900/30 bg-purple-900/5 rounded-sm overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-20">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                            </div>
                            
                            <div className="relative z-10">
                                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block mb-2">OPERATION ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                <h1 className="text-xl font-bold text-white leading-tight tracking-tight mb-4 uppercase">{itinerary.title}</h1>
                                
                                <div className="grid grid-cols-2 gap-4 border-t border-purple-500/20 pt-4">
                                    <div>
                                        <div className="text-[8px] font-mono text-zinc-500 uppercase">EST. COST</div>
                                        <div className="text-sm font-mono text-purple-200">{itinerary.totalCostEstimate}</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-mono text-zinc-500 uppercase">WAYPOINTS</div>
                                        <div className="text-sm font-mono text-purple-200">{itinerary.items.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Timeline */}
                        <div className="relative pl-4 space-y-0">
                            {/* Route Line */}
                            <div className="absolute left-[21px] top-4 bottom-8 w-px border-l border-dashed border-zinc-700"></div>

                            {itinerary.items.map((item, index) => (
                                <div key={item.id} className="relative pl-8 pb-8 last:pb-0 group">
                                    {/* Node */}
                                    <div className="absolute left-0 top-1 w-[11px] h-[11px] rounded-full bg-black border-2 border-zinc-600 group-hover:border-purple-500 group-hover:scale-125 transition-all z-10"></div>
                                    
                                    <div className="flex flex-col gap-1 mb-2">
                                        <span className="text-[9px] font-mono text-purple-400">{item.timeOffset}</span>
                                        <h3 className={`font-bold text-sm uppercase ${item.businessId ? 'text-white underline decoration-zinc-800 decoration-dotted underline-offset-4 cursor-pointer hover:text-purple-300' : 'text-zinc-300'}`} onClick={() => item.businessId && onSelectBusiness(item.businessId)}>
                                            {item.business?.name || item.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="p-3 bg-zinc-900/30 border-l-2 border-zinc-800 group-hover:border-purple-500/50 transition-colors">
                                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Footer Action */}
                        <div className="pt-4 sticky bottom-0 bg-[#09090b]/95 backdrop-blur py-4 -mx-6 px-6 border-t border-zinc-800 space-y-2">
                             {onPlotCourse && (
                                 <button 
                                    onClick={() => onPlotCourse(itinerary)}
                                    className="w-full py-3 bg-purple-900/50 hover:bg-purple-800 text-white text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-colors rounded-sm flex items-center justify-center gap-3 border border-purple-500/30 group"
                                 >
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                                    INITIATE ROUTE PROJECTION
                                 </button>
                             )}
                             {onSaveMission && (
                                 <button 
                                    onClick={handleSave}
                                    disabled={isSaved}
                                    className={`w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-colors rounded-sm flex items-center justify-center gap-3 border border-zinc-700 ${isSaved ? 'text-green-500 border-green-900 bg-green-900/10' : ''}`}
                                 >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                    {isSaved ? 'MISSION ARCHIVED' : 'ARCHIVE PLAN'}
                                 </button>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
  );
};
