
import React, { useState } from 'react';
import { Business } from '../../types';

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

    const handleShare = () => {
        const text = `TARGET: ${business.name} // LOC: ${business.address}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full md:w-[450px] bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col relative">
            <div className="relative h-64 md:h-80 shrink-0 group overflow-hidden">
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
                    
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-2 py-1 border-l-2 border-primary">
                        <span className="text-[10px] font-mono text-primary font-bold tracking-widest">IMG_SEQ_001</span>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
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
                    {/* Live Crowd Meter */}
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
                        
                        {business.waitEstimate !== undefined && business.waitEstimate > 0 && (
                            <div className="mt-2 text-right">
                                <span className="text-[9px] font-mono text-primary uppercase tracking-wider">
                                    EST. WAIT: {business.waitEstimate} MIN
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
                    <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
                        <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">RATING</div>
                        <div className="text-xl font-bold text-white group-hover:text-primary transition-colors">{business.rating?.toFixed(1) || 'N/A'}</div>
                    </div>
                    <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
                        <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">COST</div>
                        <div className="text-xl font-bold text-white">{business.priceLevel || '-'}</div>
                    </div>
                    <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
                        <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">PROXIMITY</div>
                        <div className="text-xl font-bold text-white">{business.distanceMeters ? `${(business.distanceMeters/1000).toFixed(1)}k` : '-'}</div>
                    </div>
                </div>

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
