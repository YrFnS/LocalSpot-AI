
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
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none mb-6">
            <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-xl p-3 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-6 duration-300 flex items-center gap-4">
                <div className="flex gap-2">
                    {[0, 1].map((idx) => {
                        const item = items[idx];
                        return (
                            <div 
                                key={idx} 
                                className={`
                                    w-32 h-16 rounded border border-dashed flex items-center justify-center relative overflow-hidden group
                                    ${item ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/20'}
                                `}
                            >
                                {item ? (
                                    <>
                                        <img src={item.photos?.[0]?.name} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                        <div className="relative z-10 p-2 text-center w-full">
                                            <p className="text-[10px] font-bold text-white truncate leading-tight">{item.name}</p>
                                        </div>
                                        <button 
                                            onClick={() => onRemove(item.id)}
                                            className="absolute top-1 right-1 w-4 h-4 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition-colors z-20"
                                        >
                                            ×
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-[9px] font-mono text-zinc-600 uppercase">Empty Slot</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="h-10 w-[1px] bg-zinc-800 mx-1"></div>

                <button
                    onClick={onAnalyze}
                    disabled={items.length < 2 || isAnalyzing}
                    className={`
                        h-10 px-6 rounded font-mono text-xs font-bold tracking-widest uppercase transition-all
                        ${items.length < 2 
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800' 
                            : 'bg-primary hover:bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95'}
                    `}
                >
                    {isAnalyzing ? (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                            PROCESSING
                        </span>
                    ) : 'ANALYZE VS'}
                </button>
            </div>
        </div>
    );
};
