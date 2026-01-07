
import { Business, Coordinates } from "../types";
import { getPhotosForType } from "../services/imageService";
import { calculateDistanceMeters } from "./geoUtils";

export const mapAiResponseToBusiness = (
    item: any, 
    index: number, 
    userLocation: Coordinates | null
): Business => {
    // Fallback location jitter if AI fails to extract exact coords or returns duplicates
    const lat = item.latitude || (userLocation?.latitude || 0) + (Math.random() * 0.01 - 0.005);
    const lng = item.longitude || (userLocation?.longitude || 0) + (Math.random() * 0.01 - 0.005);
    const bizLocation = { latitude: lat, longitude: lng };

    // Use extracted photo if available, otherwise fallback to curated aesthetic photos
    let photos = getPhotosForType(item.type || 'default');
    
    if (item.photoUri && typeof item.photoUri === 'string' && item.photoUri.startsWith('http')) {
        photos = [{
            name: item.photoUri,
            widthPx: 800, 
            heightPx: 600,
            authorAttributions: []
        }];
    }

    // Infer trend based on crowd level (fake logic for demo)
    const trend = (item.crowdLevel || 50) > 75 ? 'UP' : ((item.crowdLevel || 50) < 30 ? 'DOWN' : 'STABLE');

    return {
        id: `biz-${index}-${Date.now()}`,
        name: item.name,
        description: item.description,
        types: [item.type],
        priceLevel: item.price || "$$",
        address: item.address || "Local",
        location: bizLocation,
        distanceMeters: userLocation ? calculateDistanceMeters(userLocation, bizLocation) : 0,
        rating: item.rating || 4.5,
        ratingCount: item.ratingCount || 100,
        vibe: item.vibe || "Local",
        bestFor: item.bestFor || [],
        openNow: item.openNow !== undefined ? item.openNow : true, 
        verified: Math.random() > 0.8,
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
