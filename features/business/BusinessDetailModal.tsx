
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
    const text = `TARGET: ${business.name} // LOC: ${business.address}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleBook = (slot: BookingSlot, guests: number) => {
      console.log("Booked", slot, guests);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="
          relative w-full max-w-6xl h-full md:h-[90vh] 
          bg-[#050505] border border-zinc-800 
          flex flex-col md:flex-row overflow-hidden
          shadow-[0_0_50px_rgba(0,0,0,0.8)]
        "
        onClick={(e) => e.stopPropagation()}
      >
         {/* Decorative Corner Markers */}
         <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 pointer-events-none z-50"></div>
         <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50 pointer-events-none z-50"></div>
         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50 pointer-events-none z-50"></div>
         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 pointer-events-none z-50"></div>

         {/* Left Column: Visual Intelligence */}
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

         {/* Right Column: Data Streams */}
         <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
             
             {/* Header Bar */}
             <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80">
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-primary rounded-sm animate-pulse"></div>
                     <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">LIVE DATA FEED // ENCRYPTED</span>
                 </div>
                 <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-950/30 transition-all rounded-sm"
                 >
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-10">
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-8">
                         {/* Eavesdrop Module */}
                         <EavesdropPlayer business={business} />

                         {/* Booking Module */}
                         {business.bookingAvailable && business.slots && (
                             <div className="border border-zinc-800 p-4 bg-zinc-900/10">
                                 <h3 className="text-[10px] font-mono text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                     <span className="w-1 h-1 bg-primary"></span> RESERVATION PROTOCOL
                                 </h3>
                                 <BookingWidget slots={business.slots} onBook={handleBook} />
                             </div>
                         )}
                         
                         {/* Annotations */}
                         <div className="border border-zinc-800 p-4 bg-zinc-900/10">
                             <div className="flex justify-between items-center mb-4">
                                 <h3 className="text-[10px] font-mono text-yellow-600 uppercase tracking-widest">FIELD NOTES</h3>
                                 <button onClick={() => onToggleFavorite(business)} className={isFavorite ? 'text-red-500' : 'text-zinc-600'}>
                                     {isFavorite ? '♥ SAVED' : '♡ SAVE'}
                                 </button>
                             </div>
                             {isFavorite ? (
                                <UserAnnotations 
                                    businessId={business.id}
                                    userNote={userNote}
                                    userTags={userTags}
                                    onUpdateNote={onUpdateNote}
                                    onAddTag={onAddTag}
                                    onRemoveTag={onRemoveTag}
                                />
                             ) : (
                                 <div className="text-center py-4 text-[10px] text-zinc-600 font-mono">
                                     Save this entity to append field notes.
                                 </div>
                             )}
                         </div>
                     </div>

                     <div className="space-y-8">
                         {/* Concierge Terminal */}
                         <BusinessConcierge business={business} />

                         {/* Photo Gallery Grid */}
                         <PhotoGallery photos={business.photos} businessName={business.name} />
                         
                         {/* Reviews Stream */}
                         <ReviewList reviews={business.reviews} />
                     </div>
                 </div>
             </div>
             
             {/* Background Grid Texture */}
             <div className="absolute inset-0 pointer-events-none opacity-5" 
                  style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>
         </div>
      </div>
    </div>
  );
};
