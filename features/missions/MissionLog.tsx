
import React from 'react';
import { Itinerary } from '../../types';
import { MissionCard } from './MissionCard';

interface MissionLogProps {
    missions: Itinerary[];
    onDelete: (id: string) => void;
    onLoad: (mission: Itinerary) => void;
}

export const MissionLog: React.FC<MissionLogProps> = ({ missions, onDelete, onLoad }) => {
    if (missions.length === 0) {
        return (
            <div className="p-8 text-center text-zinc-600 text-xs font-mono flex flex-col items-center gap-2 mt-10">
                <div className="w-16 h-16 rounded-sm border border-zinc-800 border-dashed flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                NO ARCHIVED MISSIONS FOUND
                <span className="opacity-50 text-[9px]">Use the CURATOR tool to generate new plans.</span>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 pb-24">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">STORED_OPERATIONS</span>
                <span className="text-[9px] font-mono text-zinc-600">{missions.length} FILES</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {missions.map((mission) => (
                    <MissionCard 
                        key={mission.id || Math.random()} 
                        mission={mission} 
                        onDelete={onDelete} 
                        onLoad={onLoad} 
                    />
                ))}
            </div>

            <div className="text-center pt-8">
                <div className="inline-block px-3 py-1 bg-zinc-900/50 rounded text-[9px] font-mono text-zinc-600">
                    END_OF_LOG
                </div>
            </div>
        </div>
    );
};
