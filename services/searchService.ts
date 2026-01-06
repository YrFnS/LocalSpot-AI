
import { Business, Coordinates, WeatherState } from "../types";
import { mapAiResponseToBusiness } from "../utils/mapper";
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

    const groundResponse = await ai.models.generateContent({
      model: groundModel,
      contents: `Find at least 20 distinct businesses for "${contextualQuery}" near ${userLocation ? `${userLocation.latitude},${userLocation.longitude}` : 'me'}. 
      Include address, rating, review count, and open status.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: retrievalConfig ? { retrievalConfig } : undefined, 
        systemInstruction: `Current Time: ${timeContext}. Weather: ${weatherContext}. Find REAL places. Prioritize density and variety suitable for this weather/time.`,
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

        TASK:
        1. Extract business details into JSON.
        2. Infer a short "Vibe" (e.g., "Cozy", "Industrial") based on the place and current weather context.
        3. If the place is a Restaurant/Bar/Cafe, GENERATE 'slots' (Array<{time: string, available: boolean}>) for the next few hours based on its likely busyness.
        
        SCHEMA:
        Array<{
            name: string, 
            description: string, 
            type: string, 
            price: string, 
            address: string,
            latitude: number,
            longitude: number,
            rating: number,
            ratingCount: number,
            vibe: string, 
            bestFor: string[],
            openNow: boolean,
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
