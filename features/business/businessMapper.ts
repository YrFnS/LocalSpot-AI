
import { Business, Coordinates } from "../../types";
import { getPhotosForType } from "./imageService";
import { calculateDistanceMeters } from "../../utils/geoUtils";

export const mapAiResponseToBusiness = (
    item: any, 
    index: number, 
    userLocation: Coordinates | null
): Business => {
    // 1. LOCATION LOGIC
    // Only use jitter fallback if the AI completely failed to return coordinates.
    // The prompt is now engineered to return them, so this fallback should rarely trigger.
    let lat = item.latitude;
    let lng = item.longitude;
    let isRealLocation = true;

    if (!lat || !lng || (lat === 0 && lng === 0)) {
        isRealLocation = false;
        // Fallback: Random jitter around user to ensure it appears on map (better than null)
        lat = (userLocation?.latitude || 0) + (Math.random() * 0.02 - 0.01);
        lng = (userLocation?.longitude || 0) + (Math.random() * 0.02 - 0.01);
    }
    const bizLocation = { latitude: lat, longitude: lng };

    // 2. IMAGE LOGIC
    // Strict validation on photoUri. Google Grounding often returns non-image URLs.
    let photos: {name: string, widthPx: number, heightPx: number, authorAttributions: any[]}[] = [];
    
    const isValidImage = (url: string) => {
        if (!url || typeof url !== 'string') return false;
        return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null || url.includes('images.unsplash.com') || url.includes('googleusercontent.com');
    };

    if (item.photoUri && isValidImage(item.photoUri)) {
        photos = [{
            name: item.photoUri,
            widthPx: 800, 
            heightPx: 600,
            authorAttributions: []
        }];
    } else {
        // High-quality aesthetic fallback
        photos = getPhotosForType(item.type || 'default');
    }

    // Infer trend based on crowd level (fake logic for demo)
    const trend = (item.crowdLevel || 50) > 75 ? 'UP' : ((item.crowdLevel || 50) < 30 ? 'DOWN' : 'STABLE');

    return {
        id: `biz-${index}-${Date.now()}`,
        name: item.name,
        description: item.description,
        types: [item.type || "Point of Interest"],
        priceLevel: item.price || "$$",
        address: item.address || "Local",
        location: bizLocation,
        distanceMeters: userLocation ? calculateDistanceMeters(userLocation, bizLocation) : 0,
        rating: item.rating || 4.5,
        ratingCount: item.ratingCount || 100,
        vibe: item.vibe || "Local",
        bestFor: item.bestFor || [],
        openNow: item.openNow !== undefined ? item.openNow : true, 
        verified: isRealLocation && Math.random() > 0.8, // Only verify if we got real coords
        phoneNumber: "(555) Local-01",
        hours: "10:00 AM - 10:00 PM",
        matchScore: item.matchScore || Math.floor(Math.random() * 40) + 60,
        crowdLevel: item.crowdLevel || Math.floor(Math.random() * 100),
        waitEstimate: item.waitEstimate || 0,
        trendingTrend: trend,
        menuItems: item.menuItems || [],
        bookingAvailable: item.slots && item.slots.length > 0,
        slots: item.slots,
        photos: photos,
        reviews: item.reviews?.map((r: any) => ({
            authorAttribution: { displayName: r.user || 'Local Guide', photoUri: '' },
            text: { text: r.text, languageCode: 'en' },
            rating: r.rating || 5,
            relativePublishTimeDescription: 'Recently'
        }))
    };
};
