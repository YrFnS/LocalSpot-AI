
import React from 'react';
import { Business } from '../../types';

interface BusinessCrowdMeterProps {
  crowdLevel: number;
  waitEstimate?: number;
}

export const BusinessCrowdMeter: React.FC<BusinessCrowdMeterProps> = ({ crowdLevel, waitEstimate }) => {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
        <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${crowdLevel > 75 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
                LIVE_OCCUPANCY
            </span>
            <span className="text-[10px] font-mono text-zinc-300">
                {crowdLevel}% CAPACITY
            </span>
        </div>
        
        {/* Bar Graph */}
        <div className="h-12 flex items-end gap-1 mb-2 border-b border-zinc-800 pb-1">
            {[...Array(20)].map((_, i) => {
                const height = Math.random() * 50 + 20;
                // Highlight "current" time
                const isCurrent = i === 15;
                return (
                    <div key={i} className="flex-1 bg-zinc-800/50 relative group/bar">
                        <div 
                        className={`absolute bottom-0 w-full transition-all duration-1000 ${isCurrent ? 'bg-primary animate-pulse' : 'bg-zinc-700'}`}
                        style={{ height: `${isCurrent ? crowdLevel : height}%` }}
                        ></div>
                    </div>
                );
            })}
        </div>
        
        <div className="flex justify-between text-[9px] font-mono text-zinc-600">
            <span>12PM</span>
            <span className="text-primary">NOW</span>
            <span>12AM</span>
        </div>
        
        {waitEstimate !== undefined && waitEstimate > 0 && (
            <div className="mt-2 text-right">
                <span className="text-[9px] font-mono text-primary uppercase tracking-wider">
                    EST. WAIT: {waitEstimate} MIN
                </span>
            </div>
        )}
    </div>
  );
};
