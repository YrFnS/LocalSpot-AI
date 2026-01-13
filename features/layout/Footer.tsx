
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="z-50 bg-[#050505] border-t border-zinc-800 h-8 flex items-center px-4 justify-between font-mono text-[9px] text-zinc-600 select-none relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

            <div className="flex items-center gap-6 relative z-10">
                <span className="text-primary flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="tracking-widest font-bold">SYSTEM_ONLINE</span>
                </span>
                <span className="hidden md:inline text-zinc-500 tracking-wider">V2.0.0 // INTELLIGENT_NETWORK</span>
            </div>

            <div className="flex-1 mx-8 overflow-hidden relative opacity-60 hidden sm:block">
                <div className="absolute inset-0 flex items-center whitespace-nowrap animate-[marquee_25s_linear_infinite]">
                    <span className="mx-8 text-zinc-500">ESTABLISHING SECURE CONNECTION...</span>
                    <span className="mx-8 text-primary/70">GEOSPATIAL DATA STREAM: ACTIVE</span>
                    <span className="mx-8 text-zinc-500">AUDIO UPLINK: STANDBY</span>
                    <span className="mx-8 text-primary/70">GEMINI AGENTS: LISTENING</span>
                    <span className="mx-8 text-zinc-500">ENCRYPTION: AES-256</span>
                </div>
                {/* Gradient Masks for Marquee */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="flex items-center gap-1">
                    <div className="w-1 h-3 bg-green-500/20">
                        <div className="h-full bg-green-500 animate-[bounce_1s_infinite]"></div>
                    </div>
                    <div className="w-1 h-3 bg-green-500/20">
                        <div className="h-full bg-green-500 animate-[bounce_1.2s_infinite]"></div>
                    </div>
                    <div className="w-1 h-3 bg-green-500/20">
                        <div className="h-full bg-green-500 animate-[bounce_0.8s_infinite]"></div>
                    </div>
                </div>
                <span className="hidden md:inline text-zinc-500">14MS</span>
                <span className="text-zinc-700">|</span>
                <span className="text-zinc-500">MEM: 128MB</span>
            </div>
        </footer>
    );
};
