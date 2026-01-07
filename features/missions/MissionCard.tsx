
import React from 'react';
import { Itinerary } from '../../types';

interface MissionCardProps {
    mission: Itinerary;
    onDelete: (id: string) => void;
    onLoad: (mission: Itinerary) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onDelete, onLoad }) => {
    return (
        <div className="group relative bg-[#09090b] border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
            {/* Holographic Header Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-purple-900 via-purple-500 to-purple-900 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="p-5 relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
                            OP_ID: {mission.id?.substring(0,6).toUpperCase()}
                        </span>
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-purple-300 transition-colors">
                            {mission.title}
                        </h3>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 flex flex-col items-end">
                        <span>{new Date(mission.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span>{mission.totalCostEstimate}</span>
                    </div>
                </div>

                {/* Waypoint Visualization */}
                <div className="relative py-2 mb-4 space-y-2">
                    <div className="absolute left-[5px] top-2 bottom-2 w-px border-l border-dashed border-zinc-800"></div>
                    {mission.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 pl-3 relative">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-purple-500 transition-colors"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-zinc-300 truncate">{item.title}</p>
                            </div>
                        </div>
                    ))}
                    {mission.items.length > 3 && (
                        <div className="pl-3 text-[9px] font-mono text-zinc-600">
                            + {mission.items.length - 3} MORE WAYPOINTS
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={() => onLoad(mission)}
                        className="flex-1 py-2 bg-zinc-900 hover:bg-purple-900/30 border border-zinc-800 hover:border-purple-500/30 text-[9px] font-mono font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-all"
                    >
                        LOAD_MISSION
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); mission.id && onDelete(mission.id); }}
                        className="px-3 py-2 bg-zinc-900 hover:bg-red-900/30 border border-zinc-800 hover:border-red-500/30 text-zinc-500 hover:text-red-400 transition-all"
                        title="Delete Mission"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
};
