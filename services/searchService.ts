
import { Business, Coordinates, WeatherState } from "../types";
import { mapAiResponseToBusiness } from "../features/business/businessMapper";
import { getWeatherDescription } from "./weatherService";
import { ai } from "./aiClient";

export const getFeaturedBusinesses = async (
    userLocation: Coordinates | null
): Promise<Business[]> => {
    const { businesses } = await searchLocalBusinesses(
        "trending spots right now", 
        userLocation
    );
    return businesses.slice(0, 15); 
};

export const searchLocalBusinesses = async (
  query: string, 
  userLocation: Coordinates | null,
  weather?: WeatherState
): Promise<{ text: string; businesses: Business[] }> => {
  
  try {
    const groundModel = 'gemini-2.5-flash';
    const structureModel = 'gemini-3-flash-preview';
    
    const retrievalConfig = userLocation
      ? { latLng: { latitude: userLocation.latitude, longitude: userLocation.longitude } }
      : undefined;

    const timeContext = new Date().toLocaleString('en-US', { 
        weekday: 'long', hour: 'numeric', minute: 'numeric' 
    });
    const weatherContext = weather ? getWeatherDescription(weather) : "Unknown";

    // STEP 1: Grounded Search
    const contextualQuery = `${query} (Context: ${timeContext}, ${weatherContext})`;
    const locationContext = userLocation ? "nearby" : "around here";

    const groundResponse = await ai.models.generateContent({
      model: groundModel,
      contents: `
      Find at least 15 distinct real businesses for "${contextualQuery}" ${locationContext}.
      
      CRITICAL DATA EXTRACTION RULES:
      1. EXACT LOCATION: You MUST find the specific numeric "Latitude" and "Longitude" for every result using Google Maps.
      2. REAL IMAGES: You MUST search for a valid, specific image URL (e.g. from the business website, social media, or review site) for EACH result.
      3. ADDRESS: Full street address is required.
      4. If you cannot find a REAL photo for a specific place, explicitly state "NO_PHOTO". Do NOT invent a URL.
      
      Format the list clearly.
      `,
      config: {
        // We use both Google Maps (for location/places) and Google Search (to find real image URLs)
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: retrievalConfig ? { retrievalConfig } : undefined, 
        systemInstruction: `You are a Local Guide. Accuracy is paramount. Never invent coordinates or image URLs. Only return data verified by the tools.`,
      },
    });

    const rawText = groundResponse.text || "";

    // STEP 2: Structure Data & AI Inference
    const structuredResponse = await ai.models.generateContent({
        model: structureModel,
        contents: `
        SOURCE TEXT:
        ${rawText}

        CONTEXT:
        User Location: ${userLocation?.latitude}, ${userLocation?.longitude}
        Current Time: ${timeContext}
        Weather: ${weatherContext}
        Original Query: "${query}"

        TASK:
        1. Extract business details into JSON.
        2. CRITICAL: Extract "latitude" and "longitude".
        3. CRITICAL: Extract "photoUri" ONLY if a valid real URL is present in the source text. If the text says NO_PHOTO or you are unsure, set it to null.
        4. Infer a short "Vibe" (e.g., "Cozy", "Industrial").
        5. Calculate a "matchScore" (0-100) based on relevance.
        6. ESTIMATE "crowdLevel" (0-100) and "waitEstimate" (minutes).
        7. GENERATE 3-5 'menuItems' (signature dishes/drinks).
        
        SCHEMA:
        Array<{
            name: string, 
            description: string, 
            type: string, 
            price: string, 
            address: string,
            latitude: number | null,
            longitude: number | null,
            rating: number,
            ratingCount: number,
            vibe: string, 
            bestFor: string[],
            openNow: boolean,
            matchScore: number,
            photoUri: string | null,
            crowdLevel: number,
            waitEstimate: number,
            menuItems: Array<{name: string, price: string, description: string, tags: string[]}>,
            slots: Array<{time: string, available: boolean}>, 
            reviews: Array<{user: string, text: string, rating: number}>
        }>
        `,
        config: {
            responseMimeType: 'application/json'
        }
    });
    
    let structuredData: any[] = [];
    try {
        structuredData = JSON.parse(structuredResponse.text || "[]");
    } catch (e) {
        console.error("Failed to parse structured JSON", e);
        return { text: rawText, businesses: [] };
    }

    const businesses: Business[] = structuredData.map((item, idx) => 
        mapAiResponseToBusiness(item, idx, userLocation)
    );

    return {
      text: rawText,
      businesses: businesses,
    };

  } catch (error) {
    console.error("Search Error:", error);
    return { text: "Search unavailable", businesses: [] }; 
  }
};
