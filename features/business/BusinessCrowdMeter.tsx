
import React, { useMemo } from 'react';

interface BusinessCrowdMeterProps {
  crowdLevel: number;
  waitEstimate?: number;
}

export const BusinessCrowdMeter: React.FC<BusinessCrowdMeterProps> = ({ crowdLevel, waitEstimate }) => {
  // Memoize bar heights to ensure stability across re-renders
  const bars = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      height: Math.max(10, Math.random() * 60 + 10), // Base randomness
      isCurrent: i === 18 // Fixed "current" indicator position
    }));
  }, []);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:10px_10px] pointer-events-none"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${crowdLevel > 75 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${crowdLevel > 75 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    </span>
                    LIVE_OCCUPANCY
                </span>
                <span className="text-[10px] font-mono text-zinc-300 font-bold">
                    {crowdLevel}% CAPACITY
                </span>
            </div>
            
            {/* Bar Graph */}
            <div className="h-16 flex items-end gap-[2px] mb-2 border-b border-zinc-800 pb-1 relative">
                {bars.map((bar, i) => (
                    <div key={i} className="flex-1 bg-zinc-800/30 relative group/bar h-full flex items-end overflow-hidden">
                        <div 
                            className={`w-full transition-all duration-1000 ${bar.isCurrent ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-zinc-700 group-hover/bar:bg-zinc-600'}`}
                            style={{ height: `${bar.isCurrent ? crowdLevel : bar.height}%` }}
                        ></div>
                        {/* Scanline effect on bars */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    </div>
                ))}
                
                {/* Threshold Line */}
                <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-red-500/30 border-t border-dashed border-red-500/50 pointer-events-none"></div>
            </div>
            
            <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-wider">
                <span>12:00</span>
                <span className="text-primary font-bold">CURRENT</span>
                <span>24:00</span>
            </div>
            
            {waitEstimate !== undefined && waitEstimate > 0 && (
                <div className="mt-3 flex justify-end">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-sm">
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-wider">
                            EST_WAIT: <span className="text-primary font-bold">{waitEstimate} MIN</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
