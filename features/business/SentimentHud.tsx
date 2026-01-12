
import React, { useEffect, useState } from 'react';
import { SentimentAnalysis } from './reviewService';

interface SentimentHudProps {
    analysis: SentimentAnalysis | null;
    isAnalyzing: boolean;
}

export const SentimentHud: React.FC<SentimentHudProps> = ({ analysis, isAnalyzing }) => {
    const [displayScore, setDisplayScore] = useState(0);

    // Animate score count-up
    useEffect(() => {
        if (analysis) {
            let start = 0;
            const end = analysis.sentimentScore;
            const duration = 1000;
            const incrementTime = 20;
            const steps = duration / incrementTime;
            const increment = end / steps;

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayScore(end);
                    clearInterval(timer);
                } else {
                    setDisplayScore(Math.floor(start));
                }
            }, incrementTime);

            return () => clearInterval(timer);
        } else {
            setDisplayScore(0);
        }
    }, [analysis]);

    if (!analysis && !isAnalyzing) return null;

    return (
        <div className="mb-6 bg-zinc-900/40 border border-zinc-800 p-4 relative overflow-hidden group">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* Loading State */}
            {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-2 border-primary/30 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="text-[9px] font-mono text-primary animate-pulse tracking-widest">
                        DECRYPTING_SOCIAL_SIGNALS...
                    </span>
                </div>
            )}

            {/* Result State */}
            {analysis && !isAnalyzing && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                TACTICAL SUMMARY
                            </h4>
                            <p className="text-xs font-mono text-white leading-relaxed border-l-2 border-zinc-700 pl-3">
                                "{analysis.summary}"
                            </p>
                        </div>
                        
                        {/* Score Gauge */}
                        <div className="flex flex-col items-center justify-center min-w-[80px]">
                            <div className="relative flex items-center justify-center w-16 h-16">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path 
                                        className={`${displayScore > 75 ? 'text-green-500' : (displayScore < 40 ? 'text-red-500' : 'text-yellow-500')} transition-all duration-300 ease-out`}
                                        strokeDasharray={`${displayScore}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-lg font-bold text-white leading-none">{displayScore}</span>
                                    <span className="text-[6px] font-mono text-zinc-500 uppercase">SCORE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Keywords Grid */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {analysis.keywords.map((kw, i) => (
                            <span 
                                key={i} 
                                className="px-2 py-1 bg-zinc-950 text-[9px] font-mono text-zinc-300 border border-zinc-800 uppercase tracking-wide hover:border-primary/50 transition-colors cursor-default"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {kw}
                            </span>
                        ))}
                    </div>

                    {/* Warnings Module */}
                    {analysis.warnings.length > 0 && (
                        <div className="pt-3 border-t border-zinc-800/50 mt-2">
                            <h4 className="text-[9px] font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                ADVISORIES ACTIVE
                            </h4>
                            <div className="space-y-1">
                                {analysis.warnings.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[10px] font-mono text-zinc-400 bg-red-950/10 px-2 py-1 rounded-sm border-l-2 border-red-900/50">
                                        <span className="text-red-500/50">!</span>
                                        {w}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Decor corners */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-700"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-700"></div>
        </div>
    );
};
