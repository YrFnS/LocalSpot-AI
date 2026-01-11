
import React, { useState } from 'react';
import { Business } from '../../types';
import { ChronoLens } from './ChronoLens';
import { BusinessCrowdMeter } from './BusinessCrowdMeter';
import { BusinessStatsGrid } from './BusinessStatsGrid';

interface BusinessDetailLeftColProps {
  business: Business;
  crowdLevel: number;
  onSpeak: (text: string) => void;
}

export const BusinessDetailLeftCol: React.FC<BusinessDetailLeftColProps> = ({ 
    business, 
    crowdLevel, 
    onSpeak 
}) => {
    const [copied, setCopied] = useState(false);
    const [isChronoActive, setIsChronoActive] = useState(false);

    const handleShare = () => {
        const text = `TARGET: ${business.name} // LOC: ${business.address}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full md:w-[450px] bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col relative">
            
            {/* Visual Container */}
            <div className="relative h-64 md:h-80 shrink-0 group overflow-hidden bg-black">
                    {/* Standard Modern View */}
                    <div className={`w-full h-full transition-opacity duration-700 ${isChronoActive ? 'opacity-0' : 'opacity-100'}`}>
                        {business.photos?.[0] ? (
                            <>
                            <img 
                                src={business.photos[0].name} 
                                className="w-full h-full object-cover filter grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" 
                                alt="Visual Intel"
                            />
                            <div className="crt-overlay absolute inset-0 opacity-50 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center flex-col gap-2">
                                <div className="w-16 h-16 border border-zinc-700 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="w-12 h-12 border border-zinc-600 rounded-full"></div>
                                </div>
                                <span className="font-mono text-[10px] text-zinc-600 tracking-widest">NO OPTICAL FEED</span>
                            </div>
                        )}
                    </div>

                    {/* Chrono Lens Layer */}
                    <ChronoLens 
                        business={business} 
                        isActive={isChronoActive} 
                        onToggle={() => setIsChronoActive(false)} 
                    />
                    
                    {/* Modern UI Overlays (Hide when Chrono Active) */}
                    <div className={`absolute top-4 left-4 right-4 flex justify-between items-start transition-opacity duration-500 ${isChronoActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="bg-black/80 backdrop-blur px-2 py-1 border-l-2 border-primary">
                            <span className="text-[10px] font-mono text-primary font-bold tracking-widest">IMG_SEQ_001</span>
                        </div>
                        
                        <button 
                            onClick={() => setIsChronoActive(true)}
                            className="bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 border border-amber-600/30 px-3 py-1.5 rounded-sm flex items-center gap-2 backdrop-blur-md transition-all group/time"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover/time:-rotate-180 transition-transform duration-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">CHRONO_LENS</span>
                        </button>
                    </div>
                    
                    <div className={`absolute bottom-4 left-4 right-4 transition-opacity duration-500 ${isChronoActive ? 'opacity-0' : 'opacity-100'}`}>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none mb-2 uppercase transparent-text-stroke relative z-10">
                        {business.name}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                        {business.types?.map(t => (
                            <span key={t} className="text-[9px] font-mono uppercase bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 tracking-wider">
                                {t}
                            </span>
                        ))}
                        </div>
                    </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                <BusinessCrowdMeter crowdLevel={crowdLevel} waitEstimate={business.waitEstimate} />
                
                <BusinessStatsGrid business={business} />

                {/* AI Analysis Block */}
                <div className="border border-dashed border-zinc-700 p-4 bg-zinc-900/30 relative">
                    <div className="absolute -top-2 left-2 px-1 bg-[#09090b] text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                        INTELLIGENCE BRIEF
                    </div>
                    <p className="text-sm font-mono text-zinc-300 leading-relaxed text-justify text-xs">
                        {business.description || "No intelligence data available for this entity."}
                    </p>
                    <div className="mt-3 flex justify-end">
                        <button 
                            onClick={() => onSpeak(business.description || '')} 
                            className="flex items-center gap-2 text-[9px] font-mono text-primary hover:text-white uppercase tracking-widest transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            PLAY AUDIO LOG
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-b border-zinc-800 pb-1">
                        <span>OPERATIONAL STATUS</span>
                        <span className={business.openNow ? 'text-green-500' : 'text-red-500'}>{business.openNow ? 'ACTIVE / OPEN' : 'OFFLINE / CLOSED'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-b border-zinc-800 pb-1">
                        <span>COORDINATES</span>
                        <span className="truncate max-w-[200px]">{business.address}</span>
                    </div>
                    {business.hours && (
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-b border-zinc-800 pb-1">
                            <span>WINDOW</span>
                            <span>{business.hours}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <a 
                        href={business.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-center font-mono text-[10px] font-bold uppercase tracking-widest border border-zinc-700 transition-all hover:border-primary/50"
                    >
                        NAVIGATE
                    </a>
                    <button
                        onClick={handleShare}
                        className="py-3 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white text-center font-mono text-[10px] font-bold uppercase tracking-widest border border-zinc-800 hover:border-zinc-600 transition-all"
                    >
                        {copied ? 'COPIED' : 'SHARE COORDS'}
                    </button>
                </div>
            </div>
        </div>
    );
};
