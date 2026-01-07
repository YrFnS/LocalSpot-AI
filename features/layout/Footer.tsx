
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="z-50 bg-[#050505] border-t border-zinc-800 h-6 flex items-center px-4 justify-between font-mono text-[9px] text-zinc-600 select-none">
            <div className="flex items-center gap-4">
                <span className="text-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    SYSTEM_ONLINE
                </span>
                <span className="hidden md:inline">VERSION 2.5.0-ALPHA</span>
            </div>
            <div className="flex-1 mx-4 overflow-hidden relative opacity-50">
                <div className="absolute inset-0 flex items-center whitespace-nowrap animate-[marquee_20s_linear_infinite]">
                    <span className="mx-4">CONNECTING TO GEMINI NEURAL NET...</span>
                    <span className="mx-4">GEOSPATIAL DATA STREAM: ACTIVE</span>
                    <span className="mx-4">AUDIO UPLINK: STANDBY</span>
                    <span className="mx-4">SECURITY PROTOCOLS: ENGAGED</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="hidden md:inline">LATENCY: 14MS</span>
                <span className="text-zinc-500">MEM: 128MB</span>
            </div>
        </footer>
    );
};
