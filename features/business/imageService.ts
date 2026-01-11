
// Curated Unsplash Images for Aesthetics
// We use high-quality aesthetic fallbacks because fetching real photo binaries 
// from the grounding tool is restricted in the current API environment.
const PHOTO_MAP: Record<string, string[]> = {
    restaurant: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"
    ],
    cafe: [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80"
    ],
    bar: [
        "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=800&q=80",
        "https://images.unsplash.com/photo-1574096079513-d8259960295d?w=800&q=80",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80"
    ],
    park: [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80"
    ],
    art: [
        "https://images.unsplash.com/photo-1518998053901-5348d3969104?w=800&q=80",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80"
    ],
    default: [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80"
    ]
};

export const getPhotosForType = (type: string): {name: string, widthPx: number, heightPx: number, authorAttributions: any[]}[] => {
    const key = Object.keys(PHOTO_MAP).find(k => type.toLowerCase().includes(k)) || 'default';
    // Return a random slice to vary visuals
    const photos = PHOTO_MAP[key];
    const start = Math.floor(Math.random() * Math.max(0, photos.length - 2));
    return photos.slice(start, start + 3).map(url => ({
        name: url,
        widthPx: 800,
        heightPx: 600,
        authorAttributions: []
    }));
};
