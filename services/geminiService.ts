import { GoogleGenAI, Modality } from "@google/genai";
import { Business, Coordinates } from "../types";
import { decodeBase64, decodeAudioData, getAudioContext } from "../utils/audioUtils";
import { mapAiResponseToBusiness } from "../utils/mapper";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFeaturedBusinesses = async (
    userLocation: Coordinates | null
): Promise<Business[]> => {
    const { businesses } = await searchLocalBusinesses(
        "trending spots right now", 
        userLocation
    );
    return businesses.slice(0, 5); 
};

export const getAiSuggestions = async (userLocation: Coordinates | null): Promise<string[]> => {
    try {
        const timeContext = new Date().toLocaleString('en-US', { 
            weekday: 'long', hour: 'numeric', minute: 'numeric' 
        });
        
        // Use Gemini 3 Flash for high-speed simple generation
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                Context: User is in ${userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'San Francisco'}.
                Time: ${timeContext}.
                
                Task: Generate 5 short, distinct, punchy local search queries relevant to right now. 
                Examples: "Late night ramen", "Quiet cafes", "Live jazz".
                
                Output: JSON Array of strings only.
            `,
            config: {
                responseMimeType: 'application/json'
            }
        });

        return JSON.parse(response.text || "[]");
    } catch (e) {
        return ["Best coffee nearby", "Lunch spots", "Parks", "Dinner dates", "Cocktail bars"];
    }
};

export const searchLocalBusinesses = async (
  query: string, 
  userLocation: Coordinates | null
): Promise<{ text: string; businesses: Business[] }> => {
  
  try {
    // CRITICAL: Google Maps Grounding is only supported on Gemini 2.5 series.
    const groundModel = 'gemini-2.5-flash';
    const structureModel = 'gemini-3-flash-preview';
    
    const retrievalConfig = userLocation
      ? { latLng: { latitude: userLocation.latitude, longitude: userLocation.longitude } }
      : undefined;

    const timeContext = new Date().toLocaleString('en-US', { 
        weekday: 'long', hour: 'numeric', minute: 'numeric' 
    });

    // STEP 1: Grounded Search (Real Data)
    const groundResponse = await ai.models.generateContent({
      model: groundModel,
      contents: `Find 6-8 distinct businesses for "${query}" near ${userLocation ? `${userLocation.latitude},${userLocation.longitude}` : 'me'}. 
      Include address, rating, review count, and open status.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: retrievalConfig ? { retrievalConfig } : undefined, 
        systemInstruction: `Current Time: ${timeContext}. Find REAL places.`,
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

        TASK:
        1. Extract business details into JSON.
        2. Infer a short "Vibe" (e.g., "Cozy", "Industrial").
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

    // Map AI response to Domain Objects using isolated mapper
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

export const askBusinessQuestion = async (business: Business, question: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Business: ${business.name}. Details: ${JSON.stringify(business)}. Question: "${question}". Answer concisely as a local guide.`
        });
        return response.text || "I couldn't find that info.";
    } catch (error) {
        return "Concierge unavailable.";
    }
};

export const speakDescription = async (text: string, onStart?: () => void, onEnd?: () => void): Promise<void> => {
  try {
    const ctx = getAudioContext();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio");
    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => { if (onEnd) onEnd(); };
    if (onStart) onStart();
    source.start();
  } catch (error) {
    if (onEnd) onEnd();
  }
};
