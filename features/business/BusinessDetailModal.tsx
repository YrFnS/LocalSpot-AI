
import React, { useState } from 'react';
import { Business, BookingSlot } from '../../types';
import { BookingWidget } from './BookingWidget';
import { BusinessConcierge } from './BusinessConcierge';
import { UserAnnotations } from './UserAnnotations';
import { PhotoGallery } from './PhotoGallery';
import { ReviewList } from './ReviewList';
import { EavesdropPlayer } from './EavesdropPlayer';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="
          relative w-full max-w-5xl h-full md:h-[85vh] 
          bg-[#09090b] border border-zinc-800 
          overflow-hidden flex flex-col md:flex-row rounded-none md:rounded-lg
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
         {/* Left Column: Visuals & Core Info */}
         <div className="w-full md:w-[400px] bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col overflow-y-auto relative scrollbar-hide">
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">LIVE DATA FEED</span>
                     </div>
                     {/* Close Button Mobile */}
                     <button onClick={onClose} className="md:hidden text-zinc-400 p-2">✕</button>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter leading-none mb-4">{business.name}</h2>
                
                <div className="flex flex-wrap gap-2 mb-6">
                    {business.types?.map(t => (
                        <span key={t} className="text-[9px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 tracking-wider">
                            {t}
                        </span>
                    ))}
                    {business.openNow !== undefined && (
                        <span className={`text-[9px] font-mono uppercase px-2 py-1 border ${business.openNow ? 'border-green-900/50 text-green-500 bg-green-900/10' : 'border-red-900/50 text-red-500 bg-red-900/10'}`}>
                            {business.openNow ? 'OPEN' : 'CLOSED'}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-zinc-800 mb-6">
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">RATING</div>
                        <div className="text-xl font-bold text-primary">{business.rating?.toFixed(1)}</div>
                    </div>
                    <div className="text-center border-l border-zinc-800">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">COST</div>
                        <div className="text-xl font-bold text-zinc-300">{business.priceLevel || '-'}</div>
                    </div>
                    <div className="text-center border-l border-zinc-800">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">DIST</div>
                        <div className="text-xl font-bold text-zinc-300">{business.distanceMeters ? `${(business.distanceMeters/1000).toFixed(1)}km` : '-'}</div>
                    </div>
                </div>

                {/* AI Insight Card */}
                <div className="relative group cursor-default">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded opacity-75 blur transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative p-4 bg-zinc-900 rounded border border-zinc-800">
                         <div className="flex justify-between items-start mb-2">
                             <span className="text-[9px] font-mono text-primary uppercase tracking-[0.2em]">INTELLIGENCE</span>
                             <button onClick={() => onSpeak(business.description || '')} className="text-zinc-500 hover:text-white transition-colors">
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                             </button>
                         </div>
                         <p className="text-sm text-zinc-300 leading-relaxed font-light">
                            "{business.description}"
                         </p>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-6 bg-zinc-900/50 space-y-3 border-t border-zinc-800">
                <div className="flex gap-2">
                    <a 
                        href={business.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-white hover:bg-zinc-200 text-black text-center font-bold text-[10px] font-mono uppercase tracking-widest transition-colors"
                    >
                        INITIATE NAVIGATION
                    </a>
                    <button
                        onClick={() => onToggleFavorite(business)}
                        className={`px-4 border ${isFavorite ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-zinc-700 text-zinc-400 hover:border-white'}`}
                        title="Toggle Favorite"
                    >
                        ♥
                    </button>
                </div>
                
                <button
                    onClick={handleShare}
                    className="w-full py-2 border border-zinc-800 text-zinc-500 text-[10px] font-mono uppercase tracking-widest hover:text-white hover:border-zinc-600 transition-colors"
                >
                    {copied ? 'COORDINATES COPIED' : 'TRANSMIT COORDINATES'}
                </button>
            </div>
         </div>

         {/* Right Column: Details & Reviews */}
         <div className="flex-1 relative bg-[#09090b] flex flex-col">
             {/* Header Actions */}
             <div className="absolute top-0 right-0 p-6 z-30 hidden md:block">
                 <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white hover:border-white rounded-full transition-all"
                 >
                     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 12M2 2l10 10"/></svg>
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">
                 {/* Gallery - No CRT Effect */}
                 <div className="relative">
                    <PhotoGallery photos={business.photos} businessName={business.name} />
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-8">
                         {/* Details */}
                         <div>
                            <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-4 border-b border-zinc-800 pb-2">LOCATION DATA</h3>
                            <div className="space-y-3 text-sm font-mono text-zinc-400">
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-600 text-[10px] uppercase">ADDRESS</span>
                                    <span>{business.address || "Unknown Sector"}</span>
                                </div>
                                {business.hours && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-zinc-600 text-[10px] uppercase">OPERATING WINDOW</span>
                                        <span>{business.hours}</span>
                                    </div>
                                )}
                            </div>
                         </div>
                         
                         {/* Annotations */}
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
                     </div>

                     <div className="space-y-8">
                         {/* Eavesdrop Player (NEW) */}
                         <EavesdropPlayer business={business} />

                         {/* Booking */}
                         {business.bookingAvailable && business.slots && (
                             <BookingWidget slots={business.slots} onBook={handleBook} />
                         )}

                         {/* Concierge */}
                         <BusinessConcierge business={business} />
                     </div>
                 </div>

                 {/* Reviews */}
                 <div className="pt-8 border-t border-zinc-800/50">
                    <ReviewList reviews={business.reviews} />
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
