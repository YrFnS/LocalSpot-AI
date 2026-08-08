
import type React from 'react';
import { useState, useEffect } from 'react';
import type { Business } from '../../types';
import { getHistoricalContext, type HistoricalData } from './historyService';
import { generateHistoryVisual } from './visualService';
import { useSoundFX } from '../audio/useSoundFX';

interface ChronoLensProps {
    business: Business;
    isActive: boolean;
    onToggle: () => void;
}

export const ChronoLens: React.FC<ChronoLensProps> = ({ business, isActive, onToggle }) => {
    const [data, setData] = useState<HistoricalData | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loadingState, setLoadingState] = useState<'IDLE' | 'RESEARCHING' | 'SEARCHING_IMG' | 'READY'>('IDLE');
    const [year, setYear] = useState(2024);
    const { playHover, playSuccess } = useSoundFX();

    useEffect(() => {
        if (isActive && !data && loadingState === 'IDLE') {
            loadHistory();
        }
    }, [isActive]);

    // Year Countdown Effect with Sound
    useEffect(() => {
        if (loadingState === 'RESEARCHING' || loadingState === 'SEARCHING_IMG') {
            const interval = setInterval(() => {
                setYear(prev => Math.max(1920, prev - Math.floor(Math.random() * 10)));
                // Trigger a very subtle click for ticking effect (using hover sound for subtlety)
                if (Math.random() > 0.7) playHover(); 
            }, 50);
            return () => clearInterval(interval);
        }
    }, [loadingState]);

    const loadHistory = async () => {
        setLoadingState('RESEARCHING');
        const historyData = await getHistoricalContext(business);
        
        if (historyData) {
            setData(historyData);
            setLoadingState('SEARCHING_IMG');
            
            // Search for REAL historical photo
            const realImageUrl = await generateHistoryVisual(historyData.visualPrompt, historyData.era);
            setImage(realImageUrl);
            setLoadingState('READY');
            playSuccess();
        } else {
            setLoadingState('IDLE'); // Reset on fail
            onToggle(); // Close
        }
    };

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-20 bg-black overflow-hidden flex flex-col font-serif">
            {/* Visual Layer */}
            <div className="relative flex-1 overflow-hidden">
                {image ? (
                    <div className="w-full h-full relative animate-in fade-in duration-1000">
                        <img 
                            src={image} 
                            alt="Historical Archive" 
                            className="w-full h-full object-cover filter sepia-[0.6] contrast-110 brightness-90 grayscale-[0.3]"
                        />
                        {/* Old Film Effects */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-60 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(60,40,20,0.8)_100%)] mix-blend-multiply"></div>
                        
                        {/* Film Scratches */}
                        <div className="absolute top-0 left-[10%] w-[1px] h-full bg-white/20 animate-[pulse_0.2s_infinite] opacity-20"></div>
                        <div className="absolute top-0 right-[20%] w-[2px] h-full bg-black/30 animate-[pulse_4s_infinite] opacity-20"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1510]">
                        <div className="w-24 h-24 border border-amber-900/30 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 border-t border-amber-600 rounded-full animate-spin"></div>
                            <span className="font-mono text-3xl text-amber-600 font-bold">{year}</span>
                        </div>
                        <span className="font-mono text-amber-800 text-xs tracking-[0.3em] uppercase mt-4 animate-pulse">
                            {loadingState === 'RESEARCHING' ? 'ACCESSING CITY ARCHIVES...' : 'SEARCHING HISTORICAL DB...'}
                        </span>
                        {loadingState === 'READY' && !image && (
                            <span className="text-amber-700/50 text-[10px] mt-2">NO VISUAL RECORDS FOUND</span>
                        )}
                    </div>
                )}
            </div>

            {/* Archival Overlay */}
            {data && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0c0a08] via-[#1c1917]/90 to-transparent text-amber-100/90 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="relative border-l-2 border-amber-700 pl-4 py-1">
                        {/* Decorative Stamp */}
                        <div className="absolute -top-8 right-0 border-2 border-amber-800/50 text-amber-800/50 p-2 rounded-sm rotate-[-12deg] font-bold text-xs uppercase tracking-widest pointer-events-none">
                            ARCHIVE_FOUND
                        </div>

                        <div className="flex items-baseline gap-3 mb-2">
                            <h3 className="font-serif text-3xl italic tracking-wider text-amber-500 drop-shadow-md">
                                {data.era}
                            </h3>
                            <div className="h-px flex-1 bg-amber-900/50"></div>
                        </div>
                        
                        <p className="font-serif text-sm leading-relaxed text-amber-200/80 italic max-w-lg">
                            "{data.summary}"
                        </p>
                        
                        <div className="mt-4 flex gap-4 text-[9px] font-mono text-amber-700 uppercase tracking-widest">
                            <span>REF: {business.id.substring(0, 8)}</span>
                            <span>SOURCE: OPENROUTER</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <div className="text-[9px] font-mono text-amber-500/50 uppercase tracking-widest bg-black/20 backdrop-blur px-2 py-1 border border-amber-900/30">
                    TEMPORAL SHIFT ACTIVE
                </div>
                <button 
                    onClick={onToggle}
                    className="bg-black/60 hover:bg-amber-950/80 text-amber-500 border border-amber-800/50 px-4 py-2 text-[10px] font-mono uppercase tracking-widest backdrop-blur-md transition-colors shadow-lg"
                >
                    RETURN TO {new Date().getFullYear()}
                </button>
            </div>
        </div>
    );
};
