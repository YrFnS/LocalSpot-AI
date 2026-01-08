
import React from 'react';
import { Business } from '../../types';
import { BusinessDetailLeftCol } from './BusinessDetailLeftCol';
import { BusinessDetailRightCol } from './BusinessDetailRightCol';

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
  const crowdLevel = business.crowdLevel || 50;

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

         <BusinessDetailLeftCol 
            business={business} 
            crowdLevel={crowdLevel} 
            onSpeak={onSpeak} 
         />

         <BusinessDetailRightCol
            business={business}
            onClose={onClose}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onUpdateNote={onUpdateNote}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            userNote={userNote}
            userTags={userTags}
         />
      </div>
    </div>
  );
};
