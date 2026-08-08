
import type React from 'react';
import type { Business, BookingSlot } from '../../types';
import { BookingWidget } from './BookingWidget';
import { BusinessConcierge } from './BusinessConcierge';
import { UserAnnotations } from './UserAnnotations';
import { PhotoGallery } from './PhotoGallery';
import { ReviewList } from './ReviewList';
import { MenuRecon } from './MenuRecon';

interface BusinessDetailRightColProps {
    business: Business;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: (b: Business) => void;
    onUpdateNote?: (id: string, note: string) => void;
    onAddTag?: (id: string, tag: string) => void;
    onRemoveTag?: (id: string, tag: string) => void;
    userNote?: string;
    userTags?: string[];
}

export const BusinessDetailRightCol: React.FC<BusinessDetailRightColProps> = ({
    business,
    onClose,
    isFavorite,
    onToggleFavorite,
    onUpdateNote,
    onAddTag,
    onRemoveTag,
    userNote,
    userTags
}) => {
    
    const handleBook = (slot: BookingSlot, guests: number) => {
        console.log("Booked", slot, guests);
    };

    return (
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
                         {/* Inventory / Menu Recon */}
                         {business.menuItems && business.menuItems.length > 0 && (
                            <MenuRecon items={business.menuItems} vibe={business.vibe || 'Modern'} />
                         )}

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
    );
};
