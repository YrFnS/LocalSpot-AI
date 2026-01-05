import React from 'react';
import { Business } from '../../types';

interface ReviewListProps {
    reviews: Business['reviews'];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
    return (
        <div>
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Reviews</h3>
            {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="bg-zinc-900/50 p-4 rounded border border-zinc-800/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-zinc-200 text-xs">{review.authorAttribution.displayName}</span>
                                <span className="text-primary text-xs">{'★'.repeat(review.rating)}</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {review.text.text}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-zinc-600 text-xs italic">No reviews available via current signal.</p>
            )}
        </div>
    );
};