
// STRICT VISUAL PROTOCOL:
// We have removed all aesthetic fallbacks (Unsplash stock photos).
// The application will now only display images if a Verified Source URL is provided by the Intelligence Engine.

export const getPhotosForType = (type: string): {name: string, widthPx: number, heightPx: number, authorAttributions: any[]}[] => {
    // Return empty array. No fake images allowed.
    return [];
};
