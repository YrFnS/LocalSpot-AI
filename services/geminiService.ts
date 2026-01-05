import { GoogleGenAI, Modality } from "@google/genai";
import { Business, Coordinates, BookingSlot } from "../types";
import { decodeBase64, decodeAudioData, getAudioContext } from "../utils/audioUtils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateMockSlots = (): BookingSlot[] => {
    const slots: BookingSlot[] = [];
    const startHour = 17; // 5 PM
    for (let i = 0; i < 8; i++) {
        const hour = startHour + Math.floor(i / 2);
        const mins = i % 2 === 0 ? "00" : "30";
        slots.push({
            time: `${hour}:${mins}`,
            available: Math.random() > 0.3 // 70% chance available
        });
    }
    return slots;
};

// Curated Unsplash Images for Aesthetics
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

const getPhotosForType = (type: string): {name: string, widthPx: number, heightPx: number, authorAttributions: any[]}[] => {
    const key = Object.keys(PHOTO_MAP).find(k => type.toLowerCase().includes(k)) || 'default';
    return PHOTO_MAP[key].map(url => ({
        name: url,
        widthPx: 800,
        heightPx: 600,
        authorAttributions: []
    }));
};

export const getFeaturedBusinesses = async (
    userLocation: Coordinates | null,
    weather: string
): Promise<Business[]> => {
    // We simulate a search for "Trending" to reuse the logic
    const { businesses } = await searchLocalBusinesses(
        "trending cool spots, hidden gems, highly rated", 
        userLocation, 
        weather
    );
    return businesses.slice(0, 5); // Return top 5
};

// Search Local Businesses using Grounding
export const searchLocalBusinesses = async (
  query: string, 
  userLocation: Coordinates | null,
  weatherCondition?: string
): Promise<{ text: string; businesses: Business[] }> => {
  
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct retrieval config if location is available
    const retrievalConfig = userLocation
      ? {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        }
      : undefined;

    const timeContext = new Date().toLocaleString('en-US', { 
        weekday: 'long', 
        hour: 'numeric', 
        minute: 'numeric' 
    });

    // Enhanced System Instruction with Weather
    const systemInstruction = `
      Current Time: ${timeContext}.
      User Location: ${userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'Unknown'}.
      Weather Condition: ${weatherCondition || 'Clear'}.
      Role: You are LocalSpot, an avant-garde local discovery engine. 
      Task: Search for businesses matching the user's request. 
      Adaptation: If the weather is poor (rain, snow, cold), prioritize indoor venues or cozy spots. If sunny, suggest outdoor seating or parks.
      Style: Return structured, actionable data with distinct "vibe" descriptors.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: retrievalConfig ? {
          retrievalConfig: retrievalConfig
        } : undefined, 
        systemInstruction: systemInstruction,
      },
    });

    const structuredResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Context: User searched for "${query}" near ${userLocation?.latitude}, ${userLocation?.longitude} at ${timeContext}. Weather is ${weatherCondition || 'Clear'}.
        
        Generate a JSON list of 6 distinct businesses that fit this.
        Schema: Array<{
            name: string, 
            description: string, 
            type: string, 
            price: string, // $, $$, $$$
            latOffset: number, // small float -0.01 to 0.01
            lngOffset: number, 
            rating: number, // 3.0 to 5.0
            vibe: string, // e.g. "Moody", "Bustling", "Intimate"
            bestFor: string[], // e.g. ["Date", "Coffee"]
            openNow: boolean,
            address: string,
            reviews: Array<{user: string, text: string, rating: number}>
        }>. 
        Rules: 
        1. latOffset/lngOffset must be small relative to user.
        2. Description should be short, punchy, editorial style.
        3. Make reviews sound authentic.`,
        config: {
            responseMimeType: 'application/json'
        }
    });
    
    let structuredData: any[] = [];
    try {
        structuredData = JSON.parse(structuredResponse.text || "[]");
    } catch (e) {
        console.error("Failed to parse structured JSON", e);
    }

    const businesses: Business[] = structuredData.map((item, idx) => {
        const isBookable = ["restaurant", "bar", "cafe", "spa"].some(t => item.type?.toLowerCase().includes(t)) || Math.random() > 0.5;
        
        return {
            id: `gen-biz-${idx}-${Date.now()}`,
            name: item.name,
            description: item.description,
            types: [item.type],
            priceLevel: item.price,
            address: item.address || "Local Address",
            location: userLocation ? {
                latitude: userLocation.latitude + (item.latOffset || 0),
                longitude: userLocation.longitude + (item.lngOffset || 0)
            } : { latitude: 0, longitude: 0 },
            rating: item.rating,
            ratingCount: Math.floor(Math.random() * 500),
            vibe: item.vibe,
            bestFor: item.bestFor,
            openNow: item.openNow,
            phoneNumber: "(555) 123-4567",
            hours: "09:00 AM - 10:00 PM",
            bookingAvailable: isBookable,
            slots: isBookable ? generateMockSlots() : undefined,
            photos: getPhotosForType(item.type),
            reviews: item.reviews?.map((r: any) => ({
                authorAttribution: { displayName: r.user, photoUri: '' },
                text: { text: r.text, languageCode: 'en' },
                rating: r.rating,
                relativePublishTimeDescription: 'Recently'
            }))
        };
    });

    return {
      text: response.text || "Here are some results.",
      businesses: businesses,
    };

  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

// Text-to-Speech for Business Descriptions with State Callbacks
export const speakDescription = async (
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void
): Promise<void> => {
  try {
    const ctx = getAudioContext();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const audioBuffer = await decodeAudioData(
      decodeBase64(base64Audio),
      ctx,
      24000,
      1
    );

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
        if (onEnd) onEnd();
    };

    if (onStart) onStart();
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
    if (onEnd) onEnd();
  }
};