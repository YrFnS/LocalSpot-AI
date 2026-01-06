
import React from 'react';
import { Business } from '../../types';

interface PhotoGalleryProps {
    photos: Business['photos'];
    businessName: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, businessName }) => {
    if (!photos || photos.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">VISUAL RECON</h3>
                <span className="text-[9px] font-mono text-zinc-600 ml-auto">{photos.length} FILES FOUND</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 bg-zinc-900 border border-zinc-800 p-1">
                {photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square group overflow-hidden bg-black cursor-pointer">
                        <img 
                            src={photo.name} 
                            alt={`${businessName} ${i}`} 
                            className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                        />
                        
                        {/* Overlay Grid */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        
                        {/* Corner Brackets */}
                        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur py-1 px-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                             <span className="text-[8px] font-mono text-zinc-400 block tracking-widest">IMG_SEQ_{i.toString().padStart(3, '0')}</span>
                        </div>
                    </div>
                ))}
                
                {/* Empty Grid Cells filler for aesthetic */}
                {[...Array(Math.max(0, 6 - photos.length))].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-zinc-950 flex items-center justify-center border border-zinc-900 opacity-50">
                        <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
