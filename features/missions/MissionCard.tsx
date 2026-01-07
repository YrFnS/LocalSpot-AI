
import React from 'react';
import { Itinerary } from '../../types';

interface MissionCardProps {
    mission: Itinerary;
    onDelete: (id: string) => void;
    onLoad: (mission: Itinerary) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onDelete, onLoad }) => {
    return (
        <div className="group relative bg-[#09090b] border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            {/* Holographic Header Bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="p-5 relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 group-hover:bg-purple-400 group-hover:shadow-[0_0_8px_#a855f7] transition-all"></div>
                             <span className="text-[8px] font-mono text-purple-400/80 uppercase tracking-widest">
                                OP_ID: {mission.id?.substring(0,6).toUpperCase()}
                             </span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white uppercase tracking-tight transition-colors">
                            {mission.title}
                        </h3>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 flex flex-col items-end border-l border-zinc-800 pl-3">
                        <span>{new Date(mission.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className="text-zinc-400">{mission.totalCostEstimate}</span>
                    </div>
                </div>

                {/* Waypoint Visualization */}
                <div className="relative py-2 mb-4 space-y-2 bg-zinc-900/30 rounded-sm p-3 border border-zinc-800/50">
                    <div className="absolute left-[18px] top-4 bottom-4 w-px border-l border-dashed border-zinc-700/50"></div>
                    {mission.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 relative z-10">
                            <div className={`w-2 h-2 rounded-full border border-zinc-800 transition-colors ${idx === 0 ? 'bg-purple-500' : 'bg-zinc-700 group-hover:bg-zinc-600'}`}></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-zinc-300 truncate group-hover:text-purple-200 transition-colors">{item.title}</p>
                            </div>
                        </div>
                    ))}
                    {mission.items.length > 3 && (
                        <div className="pl-5 text-[8px] font-mono text-zinc-600 uppercase tracking-wider group-hover:text-zinc-500">
                            + {mission.items.length - 3} ADD'L VECTORS
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={() => onLoad(mission)}
                        className="flex-1 py-2 bg-zinc-900 group-hover:bg-purple-900/20 border border-zinc-800 group-hover:border-purple-500/30 text-[9px] font-mono font-bold text-zinc-400 group-hover:text-purple-300 uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2"
                    >
                        <span>LOAD PROTOCOL</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); mission.id && onDelete(mission.id); }}
                        className="px-3 py-2 bg-zinc-900 hover:bg-red-950/30 border border-zinc-800 hover:border-red-500/30 text-zinc-600 hover:text-red-400 transition-all"
                        title="Delete Mission"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
};
