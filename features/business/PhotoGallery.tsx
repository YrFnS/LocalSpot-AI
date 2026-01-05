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
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                    <div key={i} className="aspect-square relative overflow-hidden rounded bg-zinc-900 group">
                        <img 
                            src={photo.name} 
                            alt={`${businessName} ${i}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                ))}
            </div>
        </div>
    );
};