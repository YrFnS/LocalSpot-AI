
import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { generateMenuVisual } from '../../services/imageGenService';

interface MenuReconProps {
    items: MenuItem[];
    vibe: string;
}

export const MenuRecon: React.FC<MenuReconProps> = ({ items, vibe }) => {
    const [visuals, setVisuals] = useState<Record<number, string>>({});
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

    if (!items || items.length === 0) return null;

    const handleVisualize = async (index: number, item: MenuItem) => {
        if (visuals[index] || loadingIds.has(index)) return;

        setLoadingIds(prev => new Set(prev).add(index));
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
        <div className="border border-zinc-800 bg-[#09090b] relative overflow-hidden group">
            <div className="bg-zinc-900/50 p-3 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm shadow-[0_0_5px_#3b82f6]"></div>
                    <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">INVENTORY_RECON</h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 uppercase">
                    {items.length} ASSETS IDENTIFIED
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
                                    title="Visualize Dish"
                                >
                                    {loadingIds.has(i) ? (
                                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                    ) : visuals[i] ? (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    ) : (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
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

                        {/* Generated Visual Container */}
                        {visuals[i] && (
                            <div className="mt-3 relative w-full aspect-video rounded-sm overflow-hidden border border-zinc-700 animate-in fade-in zoom-in-95 duration-500">
                                <img src={visuals[i]} alt="AI Generated" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                                <div className="absolute bottom-2 left-2 flex flex-col pointer-events-none">
                                    <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest bg-blue-900/50 px-1 border border-blue-500/30 backdrop-blur-sm">
                                        AI_SIMULATION // ESTIMATED_VISUAL
                                    </span>
                                </div>
                                {/* Scanline overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                            </div>
                        )}

                        {/* Hover Highlight */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform origin-center"></div>
                    </div>
                ))}
            </div>
            
            <div className="bg-zinc-950 p-2 text-center border-t border-zinc-800">
                <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                    AI_ESTIMATED_DATA // VERIFY_ON_SITE
                </span>
            </div>
        </div>
    );
};
