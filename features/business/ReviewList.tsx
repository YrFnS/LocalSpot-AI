
import React, { useState } from 'react';
import { Business } from '../../types';
import { analyzeSentiment, SentimentAnalysis } from './reviewService';
import { SentimentHud } from './SentimentHud';

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
                        className="text-[9px] font-mono text-primary border border-primary/30 px-2 py-1 rounded-sm hover:bg-primary/10 uppercase tracking-wider transition-colors"
                    >
                        DECODE SIGNALS
                    </button>
                )}
            </div>
            
            <SentimentHud analysis={analysis} isAnalyzing={isAnalyzing} />

            {reviews && reviews.length > 0 ? (
                <div className="space-y-4 pl-3 border-l border-zinc-800/50">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="relative group animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
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
