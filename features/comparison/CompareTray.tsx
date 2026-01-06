
import React from 'react';
import { Business } from '../../types';

interface CompareTrayProps {
    items: Business[];
    onRemove: (id: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

export const CompareTray: React.FC<CompareTrayProps> = ({ items, onRemove, onAnalyze, isAnalyzing }) => {
    if (items.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center perspective-container">
            <div className="bg-[#09090b] border-t-2 border-primary border-x border-b border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto animate-in slide-in-from-bottom-12 duration-500 flex flex-col relative group">
                
                {/* Decor elements */}
                <div className="absolute -top-1 left-0 w-2 h-2 bg-primary shadow-[0_0_10px_rgba(249,115,22,1)]"></div>
                <div className="absolute -top-1 right-0 w-2 h-2 bg-primary shadow-[0_0_10px_rgba(249,115,22,1)]"></div>
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-8 border-l border-y border-zinc-800 bg-zinc-950"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-8 border-r border-y border-zinc-800 bg-zinc-950"></div>

                {/* Header Label */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 px-3 py-0.5 text-[8px] font-mono text-zinc-400 uppercase tracking-widest shadow-lg">
                    COMPARISON_DECK_ACTIVE
                </div>

                <div className="p-4 flex items-center gap-6">
                    <div className="flex gap-1">
                        {[0, 1].map((idx) => {
                            const item = items[idx];
                            return (
                                <div key={idx} className="relative group/slot">
                                    {/* Label */}
                                    <div className="absolute -top-3 left-1 text-[7px] font-mono text-zinc-600 uppercase tracking-wider">
                                        TARGET_{idx === 0 ? 'ALPHA' : 'BRAVO'}
                                    </div>

                                    <div 
                                        className={`
                                            w-36 h-20 border flex items-center justify-center relative overflow-hidden transition-all duration-300
                                            ${item ? 'border-primary/30 bg-zinc-900/50' : 'border-zinc-800 bg-black/40 border-dashed'}
                                        `}
                                    >
                                        {item ? (
                                            <>
                                                <img src={item.photos?.[0]?.name} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover/slot:grayscale-0 transition-all" alt="" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                                
                                                {/* Scanline */}
                                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

                                                <div className="relative z-10 p-2 text-left w-full h-full flex flex-col justify-end">
                                                    <p className="text-[10px] font-bold text-white truncate leading-none uppercase tracking-wider">{item.name}</p>
                                                    <p className="text-[8px] font-mono text-primary truncate mt-0.5">{item.rating?.toFixed(1)} RAT / {item.priceLevel ?? '???'}</p>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => onRemove(item.id)}
                                                    className="absolute top-0 right-0 p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-950/50 transition-colors z-20"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-50">
                                                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center rounded-full">
                                                    <span className="text-zinc-600">+</span>
                                                </div>
                                                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">AWAITING_DATA</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* VS Connector */}
                    <div className="h-12 w-[1px] bg-zinc-800 relative flex items-center justify-center">
                        <div className="w-6 h-6 bg-[#09090b] border border-zinc-700 rounded-full flex items-center justify-center z-10">
                            <span className="text-[8px] font-black text-zinc-500">VS</span>
                        </div>
                    </div>

                    <button
                        onClick={onAnalyze}
                        disabled={items.length < 2 || isAnalyzing}
                        className={`
                            h-20 px-6 font-mono text-xs font-bold tracking-[0.2em] uppercase transition-all relative overflow-hidden group/btn flex flex-col items-center justify-center gap-1 min-w-[140px]
                            ${items.length < 2 
                                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800' 
                                : 'bg-white text-black hover:bg-primary hover:text-white border border-white hover:border-primary shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]'}
                        `}
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                <span className="text-[8px]">COMPUTING</span>
                            </>
                        ) : (
                            <>
                                <span>INITIATE</span>
                                <span className="text-[8px] font-normal opacity-70">SEQUENCE</span>
                            </>
                        )}
                        
                        {/* Hover slide effect */}
                        {!isAnalyzing && items.length >= 2 && (
                            <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
