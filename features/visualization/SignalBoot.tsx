
import React from 'react';

export const SignalBoot: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[1000] bg-background flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-xs space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center font-bold text-black font-mono shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse">LS</div>
                    <div className="space-y-1">
                        <h1 className="text-xl font-black tracking-widest text-white">LOCALSPOT</h1>
                        <p className="text-[10px] font-mono text-primary/60 tracking-tighter">VERSION 2.5-STABLE // BUILD_9921</p>
                    </div>
                </div>

                <div className="space-y-3 font-mono text-[9px] text-zinc-500">
                    <div className="flex justify-between items-center">
                        <span className="animate-[pulse_1.5s_infinite]">ACQUIRING GEOSPATIAL UPLINK</span>
                        <span className="text-primary">[ OK ]</span>
                    </div>
                    <div className="flex justify-between items-center opacity-80">
                        <span>HANDSHAKE_GEMINI_LATEST</span>
                        <span className="text-primary">[ OK ]</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                        <span>INIT_HAPTIC_FEEDBACK_ENGINE</span>
                        <span className="text-primary">[ OK ]</span>
                    </div>
                    <div className="flex justify-between items-center opacity-40">
                        <span>MAPPING_SECTOR_VERTICES</span>
                        <span className="text-zinc-700">WAITING...</span>
                    </div>
                </div>

                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-[boot-progress_3s_ease-in-out_forwards]"></div>
                </div>
                
                <div className="text-center">
                    <span className="text-[8px] font-mono text-zinc-700 tracking-widest uppercase">Proprietary Signal Intelligence</span>
                </div>
            </div>
            
            <style>{`
                @keyframes boot-progress {
                    0% { width: 0%; }
                    20% { width: 10%; }
                    40% { width: 60%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};
