
import React from 'react';
import { MenuItem } from '../../types';

interface MenuReconProps {
    items: MenuItem[];
}

export const MenuRecon: React.FC<MenuReconProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

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
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight group-hover/item:text-primary transition-colors">
                                {item.name}
                            </h4>
                            <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 rounded-sm border border-primary/20">
                                {item.price}
                            </span>
                        </div>
                        
                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed max-w-[90%]">
                            {item.description}
                        </p>
                        
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                                {item.tags.map((tag, t) => (
                                    <span key={t} className="text-[8px] uppercase font-mono text-zinc-600 border border-zinc-800 px-1 rounded-sm">
                                        {tag}
                                    </span>
                                ))}
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
