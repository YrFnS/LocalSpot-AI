
import React, { useEffect, useState } from 'react';

export const SignalBoot: React.FC = () => {
    const [text, setText] = useState("");
    const tagline = "COMBINING AI-SEARCH // VOICE INTERACTION // INTELLIGENT INSIGHTS";

    useEffect(() => {
        let i = 0;
        // Typewriter effect for the tagline
        const timer = setInterval(() => {
            setText(tagline.substring(0, i));
            i++;
            if (i > tagline.length) clearInterval(timer);
        }, 25);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[1000] bg-[#09090b] flex flex-col items-center justify-center p-8 overflow-hidden select-none cursor-wait">
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_90%)] pointer-events-none"></div>
            
            <div className="relative z-10 w-full max-w-md space-y-10">
                {/* Logo Section */}
                <div className="flex items-center gap-6 justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center font-black text-2xl text-black font-mono shadow-[0_0_40px_rgba(249,115,22,0.6)] animate-pulse border border-white/20 relative z-10">
                            LS
                        </div>
                        {/* Ghosting effect */}
                        <div className="absolute inset-0 bg-primary/50 rounded-sm blur-md animate-[ping_2s_ease-out_infinite]"></div>
                    </div>
                    
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-[0.2em] text-white">LOCALSPOT</h1>
                        <div className="h-px w-full bg-gradient-to-r from-primary via-white/50 to-transparent"></div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-primary tracking-widest mt-1">
                            <span>SYS_BOOT_V2.5</span>
                            <span className="animate-pulse">ONLINE</span>
                        </div>
                    </div>
                </div>

                {/* Dynamic Tagline Typewriter */}
                <div className="h-8 flex items-center justify-center bg-zinc-900/30 border border-zinc-800/50 rounded-sm">
                    <p className="text-[10px] font-mono text-zinc-300 tracking-widest text-center px-4">
                        {text}<span className="animate-[blink_1s_step-end_infinite] text-primary">_</span>
                    </p>
                </div>

                {/* Loading Bar & Stats */}
                <div className="space-y-3">
                     <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                         <span>LOADING_INTELLIGENT_AGENTS</span>
                         <span className="text-primary font-bold">99%</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                        <div className="absolute top-0 bottom-0 left-0 bg-primary shadow-[0_0_15px_#f97316] animate-[boot-progress_2.8s_cubic-bezier(0.22,1,0.36,1)_forwards]"></div>
                        {/* Scan sheen */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                     </div>
                </div>
                
                {/* Status Log */}
                <div className="font-mono text-[9px] text-zinc-600 space-y-1.5 text-center opacity-70">
                    <div className="flex justify-center gap-2 items-center animate-[fade-in_0.3s_0.2s_both]">
                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                        <span>INITIALIZING GEOSPATIAL UPLINK...</span>
                    </div>
                    <div className="flex justify-center gap-2 items-center animate-[fade-in_0.3s_0.8s_both]">
                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                        <span>CONNECTING TO GEMINI NEURAL NET...</span>
                    </div>
                    <div className="flex justify-center gap-2 items-center animate-[fade-in_0.3s_1.4s_both]">
                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                        <span>CALIBRATING HAPTIC FEEDBACK...</span>
                    </div>
                </div>
            </div>

            {/* Bottom Proprietary Mark */}
            <div className="absolute bottom-8 text-[8px] font-mono text-zinc-800 tracking-[0.5em] uppercase">
                Proprietary Signal Intelligence
            </div>
            
            <style>{`
                @keyframes boot-progress {
                    0% { width: 0%; }
                    20% { width: 10%; }
                    50% { width: 45%; }
                    80% { width: 80%; }
                    100% { width: 100%; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};
