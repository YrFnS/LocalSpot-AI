
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="relative py-8 bg-black border-b border-zinc-800">
                     <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                     <div className="text-center">
                         <h3 className="text-primary font-mono text-xs tracking-[0.3em] uppercase mb-2">VERSUS MODE ANALYSIS</h3>
                         <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase transparent-text-stroke">
                             {result.headline || "HEAD TO HEAD"}
                         </h1>
                     </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Contenders */}
                    <div className="grid grid-cols-2 border-b border-zinc-800">
                        {[b1, b2].map((b, i) => {
                            const isWinner = result.winnerId === b.id;
                            return (
                                <div key={b.id} className={`relative p-6 flex flex-col items-center text-center ${i === 0 ? 'border-r border-zinc-800' : ''}`}>
                                    {isWinner && (
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase animate-pulse">
                                            WINNER
                                        </div>
                                    )}
                                    <div className={`w-24 h-24 rounded-full border-4 overflow-hidden mb-4 ${isWinner ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'border-zinc-800'}`}>
                                        <img src={b.photos?.[0]?.name} className="w-full h-full object-cover" alt={b.name} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-1">{b.name}</h2>
                                    <div className="flex gap-2 text-[10px] font-mono text-zinc-500 uppercase">
                                        <span>{b.rating?.toFixed(1)} ★</span>
                                        <span>•</span>
                                        <span>{b.priceLevel || "$$"}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-400 max-w-[200px] line-clamp-2">{b.vibe}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="p-6 text-center border-b border-zinc-800 bg-zinc-900/30">
                        <p className="text-sm text-zinc-300 italic font-serif leading-relaxed max-w-2xl mx-auto">
                            "{result.summary}"
                        </p>
                    </div>

                    {/* Aspects */}
                    <div className="p-6 space-y-4">
                        {result.aspects.map((aspect, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded p-4 flex flex-col md:flex-row items-center gap-4">
                                <div className="min-w-[100px] text-center md:text-left">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{aspect.name}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-between gap-4 w-full">
                                     <div className={`flex-1 text-right text-sm font-bold ${aspect.winnerId === b1.id ? 'text-primary' : 'text-zinc-600'}`}>
                                         {aspect.winnerId === b1.id ? 'WINNER' : '-'}
                                     </div>
                                     <div className="w-px h-8 bg-zinc-800"></div>
                                     <div className={`flex-1 text-left text-sm font-bold ${aspect.winnerId === b2.id ? 'text-primary' : 'text-zinc-600'}`}>
                                         {aspect.winnerId === b2.id ? 'WINNER' : '-'}
                                     </div>
                                </div>
                                <div className="w-full md:w-1/3 text-xs text-zinc-400 text-center md:text-left border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-4">
                                    {aspect.description}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Final Verdict */}
                    <div className="p-6 bg-gradient-to-b from-transparent to-primary/5 text-center">
                         <h3 className="text-xs font-mono text-primary uppercase tracking-widest mb-2">FINAL VERDICT</h3>
                         <p className="text-white font-bold text-lg mb-1">
                             {result.winnerId === b1.id ? b1.name : (result.winnerId === b2.id ? b2.name : "It's a Tie")}
                         </p>
                         <p className="text-xs text-zinc-400 max-w-md mx-auto">{result.winnerReason}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
