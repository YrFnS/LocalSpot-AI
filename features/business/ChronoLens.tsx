
import React, { useState, useEffect } from 'react';
import { Business } from '../../types';
import { getHistoricalContext, HistoricalData } from './historyService';
import { generateHistoryVisual } from './visualService';

interface ChronoLensProps {
    business: Business;
    isActive: boolean;
    onToggle: () => void;
}

export const ChronoLens: React.FC<ChronoLensProps> = ({ business, isActive, onToggle }) => {
    const [data, setData] = useState<HistoricalData | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loadingState, setLoadingState] = useState<'IDLE' | 'RESEARCHING' | 'GENERATING' | 'READY'>('IDLE');

    useEffect(() => {
        if (isActive && !data && loadingState === 'IDLE') {
            loadHistory();
        }
    }, [isActive]);

    const loadHistory = async () => {
        setLoadingState('RESEARCHING');
        const historyData = await getHistoricalContext(business);
        
        if (historyData) {
            setData(historyData);
            setLoadingState('GENERATING');
            
            const genImage = await generateHistoryVisual(historyData.visualPrompt, historyData.era);
            setImage(genImage);
            setLoadingState('READY');
        } else {
            setLoadingState('IDLE'); // Reset on fail
            onToggle(); // Close
        }
    };

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-20 bg-black overflow-hidden flex flex-col">
            {/* Visual Layer */}
            <div className="relative flex-1 overflow-hidden">
                {image ? (
                    <div className="w-full h-full relative animate-in fade-in duration-1000">
                        <img 
                            src={image} 
                            alt="Historical" 
                            className="w-full h-full object-cover filter sepia contrast-125 brightness-90"
                        />
                        {/* Film Grain Overlay */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
                        {/* Vignette */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000_100%)]"></div>
                        {/* Scratches/Artifacts (Simulated with CSS) */}
                        <div className="absolute top-0 left-10 w-[1px] h-full bg-white/10 opacity-30"></div>
                        <div className="absolute top-0 right-20 w-[2px] h-full bg-black/20 opacity-30"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1510]">
                        <div className="w-16 h-16 border-4 border-amber-900/30 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                        <span className="font-mono text-amber-700 text-xs tracking-[0.3em] uppercase animate-pulse">
                            {loadingState === 'RESEARCHING' ? 'ACCESSING ARCHIVES...' : 'DEVELOPING FILM...'}
                        </span>
                    </div>
                )}
            </div>

            {/* Context Layer */}
            {data && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent text-amber-100/80 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="border-l-2 border-amber-600 pl-4">
                        <div className="flex items-baseline justify-between mb-1">
                            <h3 className="font-serif text-2xl italic tracking-wider text-amber-500">
                                {data.era}
                            </h3>
                            <span className="text-[9px] font-mono text-amber-800 uppercase tracking-widest border border-amber-900/50 px-1">
                                CHRONO_LENS_ACTIVE
                            </span>
                        </div>
                        <p className="font-serif text-sm leading-relaxed opacity-90">
                            "{data.summary}"
                        </p>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4">
                <button 
                    onClick={onToggle}
                    className="bg-black/50 hover:bg-amber-900/50 text-amber-500 border border-amber-700/50 px-3 py-1 text-[10px] font-mono uppercase tracking-widest backdrop-blur-md transition-colors"
                >
                    RETURN TO PRESENT
                </button>
            </div>
        </div>
    );
};
