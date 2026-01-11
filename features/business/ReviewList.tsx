
import React, { useState } from 'react';
import { Business } from '../../types';
import { analyzeSentiment, SentimentAnalysis } from './reviewService';

interface ReviewListProps {
    reviews: Business['reviews'];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
    const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleDecode = async () => {
        setIsAnalyzing(true);
        const result = await analyzeSentiment(reviews);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">SENTIMENT FEED</h3>
                </div>
                {!analysis && !isAnalyzing && reviews && reviews.length > 0 && (
                    <button 
                        onClick={handleDecode}
                        className="text-[9px] font-mono text-primary border border-primary/30 px-2 py-1 rounded-sm hover:bg-primary/10 uppercase tracking-wider"
                    >
                        DECODE SIGNALS
                    </button>
                )}
            </div>
            
            {/* AI Analysis Result */}
            {(isAnalyzing || analysis) && (
                <div className="mb-6 bg-zinc-900/40 border border-zinc-800 p-4 relative overflow-hidden">
                    {/* Scanline */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-4 gap-2">
                            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-[9px] font-mono text-primary animate-pulse">PARSING SOCIAL DATA...</span>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">TACTICAL SUMMARY</h4>
                                     <p className="text-xs font-mono text-white leading-relaxed">"{analysis.summary}"</p>
                                 </div>
                                 <div className="text-center ml-4">
                                     <div className={`text-xl font-bold ${analysis.sentimentScore > 75 ? 'text-green-500' : (analysis.sentimentScore < 40 ? 'text-red-500' : 'text-yellow-500')}`}>
                                         {analysis.sentimentScore}%
                                     </div>
                                     <div className="text-[8px] font-mono text-zinc-600 uppercase">POSITIVITY</div>
                                 </div>
                             </div>

                             <div className="flex flex-wrap gap-2">
                                 {analysis.keywords.map((kw, i) => (
                                     <span key={i} className="px-2 py-0.5 bg-zinc-800 text-[9px] font-mono text-zinc-300 border border-zinc-700 uppercase">
                                         {kw}
                                     </span>
                                 ))}
                             </div>

                             {analysis.warnings.length > 0 && (
                                 <div className="pt-2 border-t border-zinc-800/50">
                                      <h4 className="text-[9px] font-mono text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                          CAUTIONARY ADVISORIES
                                      </h4>
                                      <ul className="list-disc pl-4 space-y-1">
                                          {analysis.warnings.map((w, i) => (
                                              <li key={i} className="text-[10px] font-mono text-zinc-400">{w}</li>
                                          ))}
                                      </ul>
                                 </div>
                             )}
                        </div>
                    ) : null}
                </div>
            )}

            {reviews && reviews.length > 0 ? (
                <div className="space-y-4 pl-3 border-l border-zinc-800/50">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="relative group">
                            {/* Timeline node */}
                            <div className="absolute -left-[17px] top-2 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600 group-hover:border-primary group-hover:bg-primary transition-colors"></div>
                            
                            <div className="bg-zinc-900/30 p-4 border border-zinc-800/50 hover:border-zinc-700 transition-colors rounded-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-zinc-800 rounded-sm flex items-center justify-center font-mono text-[10px] text-zinc-500 font-bold uppercase">
                                            {review.authorAttribution.displayName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-[10px] font-bold text-zinc-300 uppercase">{review.authorAttribution.displayName}</span>
                                            <span className="text-[8px] font-mono text-zinc-600">{review.relativePublishTimeDescription}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Signal Strength Rating */}
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-1 h-3 rounded-sm ${i < review.rating ? 'bg-primary' : 'bg-zinc-800'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <p className="text-xs text-zinc-400 leading-relaxed font-sans border-l-2 border-zinc-800 pl-2 group-hover:border-primary/50 transition-colors">
                                    "{review.text.text}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 border border-dashed border-zinc-800 text-center">
                    <p className="text-zinc-600 text-[10px] font-mono uppercase">No signal intercepts available.</p>
                </div>
            )}
        </div>
    );
};
