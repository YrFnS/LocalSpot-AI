import React, { useState } from 'react';
import { Business, BookingSlot } from '../../types';
import { BookingWidget } from './BookingWidget';
import { BusinessConcierge } from './BusinessConcierge';
import { UserAnnotations } from './UserAnnotations';
import { PhotoGallery } from './PhotoGallery';
import { ReviewList } from './ReviewList';

interface BusinessDetailModalProps {
  business: Business;
  onClose: () => void;
  onSpeak: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (b: Business) => void;
  onUpdateNote?: (id: string, note: string) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  userNote?: string;
  userTags?: string[];
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose,
  onSpeak,
  isFavorite,
  onToggleFavorite,
  onUpdateNote,
  onAddTag,
  onRemoveTag,
  userNote,
  userTags = []
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `Check out ${business.name} on LocalSpot! 📍 ${business.address}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleBook = (slot: BookingSlot, guests: number) => {
      console.log("Booked", slot, guests);
      // In a real app, you might sync this to state or backend
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="
          relative w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] 
          bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row rounded-lg
        "
        onClick={(e) => e.stopPropagation()}
      >
         {/* Close Button Mobile */}
         <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white md:hidden backdrop-blur-md"
         >
             ✕
         </button>

         {/* Left Column: Visuals & Core Info */}
         <div className="w-full md:w-2/5 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col overflow-y-auto">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    {business.types?.map(t => (
                        <span key={t} className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                            {t}
                        </span>
                    ))}
                    {business.openNow !== undefined && (
                        <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${business.openNow ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                            {business.openNow ? 'OPEN' : 'CLOSED'}
                        </span>
                    )}
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-2">{business.name}</h2>
                <div className="flex items-center gap-3 text-sm font-mono text-zinc-400">
                    <span className="text-primary font-bold">★ {business.rating?.toFixed(1)}</span>
                    <span>•</span>
                    <span>{business.priceLevel || 'Price N/A'}</span>
                    <span>•</span>
                    <span>{business.distanceMeters ? `${(business.distanceMeters/1000).toFixed(1)}km` : 'Nearby'}</span>
                </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 rounded border border-zinc-700/50 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">AI ANALYSIS</span>
                    <button onClick={() => onSpeak(business.description || '')} className="text-zinc-400 hover:text-white">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed font-light italic">
                    "{business.description}"
                </p>
                {business.vibe && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <span className="text-xs text-zinc-500 font-mono">VIBE: </span>
                        <span className="text-xs text-zinc-200">{business.vibe}</span>
                    </div>
                )}
            </div>

            {/* AI Concierge Component */}
            <BusinessConcierge business={business} />

            <div className="mt-auto flex flex-col gap-3">
                <div className="flex gap-2">
                    <a 
                        href={business.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-white text-black text-center font-bold text-xs font-mono hover:bg-zinc-200 transition-colors"
                    >
                        GET DIRECTIONS
                    </a>
                    <button
                        onClick={() => onToggleFavorite(business)}
                        className={`px-4 border ${isFavorite ? 'border-red-500 text-red-500' : 'border-zinc-700 text-zinc-400 hover:border-white'}`}
                        title="Toggle Favorite"
                    >
                        ♥
                    </button>
                </div>
                
                <button
                    onClick={handleShare}
                    className="w-full py-2 border border-zinc-800 text-zinc-400 text-xs font-mono hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                    {copied ? (
                        <span className="text-green-500">LINK COPIED TO CLIPBOARD</span>
                    ) : (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                            SHARE LOCATION
                        </>
                    )}
                </button>
            </div>
         </div>

         {/* Right Column: Details & Reviews */}
         <div className="flex-1 p-6 overflow-y-auto bg-background/50 relative">
             <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white hidden md:block"
             >
                 <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
             
             {/* Component: Photo Gallery */}
             <PhotoGallery photos={business.photos} businessName={business.name} />

             {/* Booking Widget (Already Extracted) */}
             {business.bookingAvailable && business.slots && (
                 <div className="mb-8">
                     <BookingWidget slots={business.slots} onBook={handleBook} />
                 </div>
             )}

             {/* Component: User Annotations */}
             {isFavorite && (
                <UserAnnotations 
                    businessId={business.id}
                    userNote={userNote}
                    userTags={userTags}
                    onUpdateNote={onUpdateNote}
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                />
             )}

             <div className="mb-8">
                 <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Best For</h3>
                 <div className="flex flex-wrap gap-2">
                    {business.bestFor?.map(tag => (
                        <span key={tag} className="px-3 py-1 border border-zinc-700 rounded-full text-xs text-zinc-300">
                            {tag}
                        </span>
                    )) || <span className="text-zinc-600 text-xs italic">General Interest</span>}
                 </div>
             </div>

             <div className="mb-8">
                <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Details</h3>
                <div className="space-y-3 text-sm text-zinc-300">
                    <div className="flex gap-4">
                        <span className="w-20 text-zinc-600">Address</span>
                        <span>{business.address || "Address unavailable"}</span>
                    </div>
                    {business.hours && (
                        <div className="flex gap-4">
                            <span className="w-20 text-zinc-600">Hours</span>
                            <span>{business.hours}</span>
                        </div>
                    )}
                    {business.phoneNumber && (
                        <div className="flex gap-4">
                            <span className="w-20 text-zinc-600">Phone</span>
                            <span>{business.phoneNumber}</span>
                        </div>
                    )}
                </div>
             </div>

             {/* Component: Review List */}
             <ReviewList reviews={business.reviews} />
         </div>
      </div>
    </div>
  );
};