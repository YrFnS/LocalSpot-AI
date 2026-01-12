
import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { generateMenuVisual } from './visualService';

interface MenuReconProps {
    items: MenuItem[];
    vibe: string;
}

export const MenuRecon: React.FC<MenuReconProps> = ({ items, vibe }) => {
    const [visuals, setVisuals] = useState<Record<number, string>>({});
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
    const [progress, setProgress] = useState<Record<number, number>>({});

    // Simulate reconstruction progress
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = { ...prev };
                loadingIds.forEach(id => {
                    next[id] = Math.min((next[id] || 0) + Math.random() * 5, 99);
                });
                return next;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [loadingIds]);

    if (!items || items.length === 0) return null;

    const handleVisualize = async (index: number, item: MenuItem) => {
        if (visuals[index] || loadingIds.has(index)) return;

        setLoadingIds(prev => new Set(prev).add(index));
        setProgress(prev => ({ ...prev, [index]: 0 }));
        
        const base64 = await generateMenuVisual(item.name, item.description, vibe);
        
        setLoadingIds(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
        });

        if (base64) {
            setVisuals(prev => ({ ...prev, [index]: base64 }));
        }
    };

    return (
        <div className="border border-zinc-800 bg-[#09090b] relative overflow-hidden group rounded-sm">
            <div className="bg-zinc-900/50 p-3 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm shadow-[0_0_5px_#3b82f6]"></div>
                    <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">MENU_RECONSTRUCTION</h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 uppercase">
                    {items.length} SIGNATURE_DISHES
                </span>
            </div>

            <div className="divide-y divide-zinc-800/50">
                {items.map((item, i) => (
                    <div key={i} className="p-3 hover:bg-zinc-900 transition-colors group/item relative">
                        <div className="flex justify-between items-start mb-1 relative z-10">
                            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight group-hover/item:text-primary transition-colors">
                                {item.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 rounded-sm border border-primary/20">
                                    {item.price}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleVisualize(i, item); }}
                                    disabled={loadingIds.has(i) || !!visuals[i]}
                                    className={`
                                        w-6 h-6 flex items-center justify-center border rounded-sm transition-all
                                        ${visuals[i] 
                                            ? 'border-blue-500 text-blue-500 bg-blue-500/10' 
                                            : 'border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 hover:bg-zinc-800'}
                                    `}
                                    title={visuals[i] ? "Visual Reconstructed" : "Initiate Reconstruction"}
                                >
                                    {visuals[i] ? (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    ) : (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M12 4v1M12 19v1M4 12H3M21 12h-1"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed max-w-[85%] relative z-10">
                            {item.description}
                        </p>
                        
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 relative z-10">
                                {item.tags.map((tag, t) => (
                                    <span key={t} className="text-[8px] uppercase font-mono text-zinc-600 border border-zinc-800 px-1 rounded-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Reconstruction Chamber */}
                        {(loadingIds.has(i) || visuals[i]) && (
                            <div className="mt-3 relative w-full aspect-video rounded-sm overflow-hidden border border-zinc-700 bg-black">
                                
                                {loadingIds.has(i) && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                                        <div className="w-16 h-16 border border-blue-500/30 relative animate-[spin_3s_linear_infinite]">
                                            <div className="absolute inset-0 border-t-2 border-blue-500"></div>
                                        </div>
                                        <div className="absolute font-mono text-[10px] text-blue-400 mt-10 tracking-widest">
                                            RENDERING... {Math.floor(progress[i] || 0)}%
                                        </div>
                                        {/* Wireframe Grid */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>
                                    </div>
                                )}

                                {visuals[i] && (
                                    <div className="absolute inset-0 animate-in fade-in duration-700">
                                        <img src={visuals[i]} alt="AI Generated" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent pointer-events-none mix-blend-overlay"></div>
                                        
                                        {/* Holographic overlay */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,0,255,0.06),rgba(0,0,0,0.06))] bg-[length:100%_2px,6px_100%] pointer-events-none opacity-30"></div>
                                        
                                        <div className="absolute bottom-2 right-2 flex flex-col items-end pointer-events-none">
                                            <span className="text-[8px] font-mono text-blue-300 uppercase tracking-widest bg-black/60 px-1 backdrop-blur-sm border border-blue-500/20">
                                                AI_SIMULATION v2.5
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hover Highlight */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform origin-center"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
