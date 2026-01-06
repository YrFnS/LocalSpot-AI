
import React from 'react';
import { Business, ComparisonResult } from '../../types';

interface ComparisonModalProps {
    b1: Business;
    b2: Business;
    result: ComparisonResult | null;
    onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ b1, b2, result, onClose }) => {
    if (!result) return null;

    const renderStatBar = (val: number, max: number, colorClass: string) => (
        <div className="h-1.5 w-full bg-zinc-800 rounded-sm overflow-hidden flex">
            {[...Array(max)].map((_, i) => (
                <div key={i} className={`flex-1 border-r border-zinc-900 ${i < val ? colorClass : 'bg-transparent'}`}></div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 p-0 md:p-8">
            <div className="relative w-full max-w-5xl bg-[#09090b] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-full md:max-h-[90vh]">
                
                {/* Tactical Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-10" 
                     style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {/* Header */}
                <div className="relative py-4 px-6 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center z-10">
                     <div className="flex items-center gap-4">
                         <div className="w-2 h-8 bg-primary"></div>
                         <div>
                             <h3 className="text-primary font-mono text-[10px] tracking-[0.3em] uppercase">TACTICAL ANALYSIS</h3>
                             <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">
                                 {result.headline || "HEAD TO HEAD"}
                             </h1>
                         </div>
                     </div>
                     <button onClick={onClose} className="text-zinc-500 hover:text-white hover:bg-zinc-800 p-2 rounded transition-all">
                        <span className="font-mono text-xs">[ CLOSE_DECK ]</span>
                     </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                    {/* The Contenders - Split View */}
                    <div className="grid grid-cols-2 relative min-h-[300px]">
                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black border border-zinc-700 rotate-45 flex items-center justify-center shadow-xl">
                            <span className="-rotate-45 font-black text-white text-sm">VS</span>
                        </div>

                        {[b1, b2].map((b, i) => {
                            const isWinner = result.winnerId === b.id;
                            const isLeft = i === 0;
                            return (
                                <div key={b.id} className={`relative p-6 md:p-10 flex flex-col ${isLeft ? 'items-end text-right border-r border-zinc-800/50' : 'items-start text-left'} transition-colors ${isWinner ? 'bg-primary/5' : ''}`}>
                                    {/* Image Mask */}
                                    <div className={`
                                        w-32 h-32 md:w-48 md:h-48 mb-6 overflow-hidden border-2 relative
                                        ${isWinner ? 'border-primary shadow-[0_0_30px_rgba(249,115,22,0.2)]' : 'border-zinc-800 grayscale opacity-70'}
                                    `}>
                                        <img src={b.photos?.[0]?.name} className="w-full h-full object-cover" alt={b.name} />
                                        {/* Scanlines */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase leading-none mb-2">{b.name}</h2>
                                    <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">{b.types?.[0] || 'ENTITY'}</p>

                                    {/* Stats */}
                                    <div className={`w-full max-w-[200px] space-y-3 ${isLeft ? 'items-end' : 'items-start'}`}>
                                        <div className="w-full">
                                            <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                                                <span>RATING</span>
                                                <span>{b.rating?.toFixed(1)}</span>
                                            </div>
                                            {renderStatBar(Math.round(b.rating || 0), 5, isWinner ? 'bg-primary' : 'bg-zinc-600')}
                                        </div>
                                        <div className="w-full">
                                            <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                                                <span>PRICE</span>
                                                <span>{b.priceLevel?.length || 1}/4</span>
                                            </div>
                                            {renderStatBar(b.priceLevel?.length || 1, 4, 'bg-zinc-500')}
                                        </div>
                                    </div>
                                    
                                    {isWinner && (
                                        <div className={`absolute top-4 ${isLeft ? 'left-4' : 'right-4'}`}>
                                            <div className="border-2 border-primary text-primary px-3 py-1 text-xs font-bold font-mono uppercase tracking-widest -rotate-6 opacity-80">
                                                Match Winner
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Analysis Stream */}
                    <div className="border-t border-zinc-800 bg-zinc-900/20 p-6 md:p-8">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="text-center mb-8">
                                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-2">AI SUMMARY LOG</h4>
                                <p className="text-sm md:text-base text-zinc-200 font-serif italic leading-relaxed">
                                    "{result.summary}"
                                </p>
                            </div>

                            <div className="grid gap-2">
                                {result.aspects.map((aspect, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row bg-zinc-900/80 border border-zinc-800 p-0 overflow-hidden">
                                        <div className="w-full md:w-32 bg-black flex items-center justify-center p-2 border-b md:border-b-0 md:border-r border-zinc-800">
                                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{aspect.name}</span>
                                        </div>
                                        
                                        <div className="flex-1 p-3 flex items-center gap-4 relative">
                                            {/* Advantage Indicator */}
                                            <div className="absolute inset-y-0 left-0 w-1 bg-zinc-800">
                                                <div className={`h-1/2 w-full transition-all ${aspect.winnerId === b1.id ? 'bg-primary top-0' : 'bg-transparent'}`}></div>
                                                <div className={`h-1/2 w-full transition-all ${aspect.winnerId === b2.id ? 'bg-primary bottom-0' : 'bg-transparent'}`}></div>
                                            </div>
                                            
                                            <p className="text-xs text-zinc-300 pl-2">{aspect.description}</p>
                                        </div>
                                        
                                        <div className="w-full md:w-32 flex items-center justify-center p-2 bg-zinc-950/50 border-t md:border-t-0 md:border-l border-zinc-800">
                                            <span className={`text-[9px] font-bold font-mono uppercase ${aspect.winnerId ? 'text-primary' : 'text-zinc-600'}`}>
                                                {aspect.winnerId === b1.id ? b1.name.substring(0,8)+'...' : (aspect.winnerId === b2.id ? b2.name.substring(0,8)+'...' : 'DRAW')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Final Verdict Footer */}
                    <div className="bg-primary/10 border-t border-primary/20 p-8 text-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                         <h3 className="text-xs font-mono text-primary-400 uppercase tracking-[0.3em] mb-2 relative z-10">RECOMMENDATION PROTOCOL</h3>
                         <p className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-2 relative z-10">
                             {result.winnerId === b1.id ? b1.name : (result.winnerId === b2.id ? b2.name : "TIE GAME")}
                         </p>
                         <p className="text-sm text-zinc-400 max-w-lg mx-auto font-mono relative z-10">{result.winnerReason}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
