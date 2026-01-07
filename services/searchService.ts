
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
    // We explicitly ask for Lat/Lng in the text output because grounding chunks aren't always available in the response text structure.
    const contextualQuery = `${query} (Context: ${timeContext}, ${weatherContext})`;

    const groundResponse = await ai.models.generateContent({
      model: groundModel,
      contents: `
      Find at least 15 distinct businesses for "${contextualQuery}" near ${userLocation ? `${userLocation.latitude},${userLocation.longitude}` : 'me'}. 
      
      CRITICAL OUTPUT RULES:
      1. For EVERY business, you MUST explicitly state its exact "Latitude" and "Longitude" in the text description.
      2. You MUST include the full street address.
      3. Try to find a specific "Image URL" from the web for each place if possible.
      4. Provide a rating and review count.
      
      Format each entry clearly so it can be parsed.
      `,
      config: {
        // We use both Google Maps (for location data) and Google Search (for finding image URLs/Websites)
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: retrievalConfig ? { retrievalConfig } : undefined, 
        systemInstruction: `You are a Local Guide. Your top priority is LOCATION ACCURACY. Always print the numeric Latitude and Longitude for every result found.`,
      },
    });

    const rawText = groundResponse.text || "";

    // STEP 2: Structure Data & AI Inference
    // We pass the raw text which now hopefully contains coords, and ask the stronger model to extract them.
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
        2. CRITICAL: Extract "latitude" and "longitude" as numbers. If they are in the text, use them. If not, do NOT invent them (leave as null).
        3. Extract "photoUri" if a valid image URL is found in the text.
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
