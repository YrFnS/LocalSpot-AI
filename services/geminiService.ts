
import { GoogleGenAI, Modality } from "@google/genai";
import { Business, Coordinates, WeatherState, ComparisonResult, VibeState } from "../types";
import { decodeBase64, decodeAudioData, getAudioContext } from "../utils/audioUtils";
import { mapAiResponseToBusiness } from "../utils/mapper";
import { getWeatherDescription } from "../services/weatherService";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFeaturedBusinesses = async (
    userLocation: Coordinates | null
): Promise<Business[]> => {
    const { businesses } = await searchLocalBusinesses(
        "trending spots right now", 
        userLocation
    );
    // Increased from 5 to 15 to show more initial content
    return businesses.slice(0, 15); 
};

export const getAiSuggestions = async (
    userLocation: Coordinates | null,
    weather?: WeatherState
): Promise<string[]> => {
    try {
        const timeContext = new Date().toLocaleString('en-US', { 
            weekday: 'long', hour: 'numeric', minute: 'numeric' 
        });
        const weatherContext = weather ? getWeatherDescription(weather) : "Unknown";
        
        // Use Gemini 3 Flash for high-speed simple generation
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                Context: User is in ${userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'San Francisco'}.
                Time: ${timeContext}.
                Weather: ${weatherContext}.
                
                Task: Generate 5 short, distinct, punchy local search queries relevant to the current context (time/weather).
                If raining, suggest cozy/indoor. If sunny, suggest outdoor/parks.
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

export const analyzeImageAndSearch = async (
    base64Image: string,
    userLocation: Coordinates | null,
    weather?: WeatherState
): Promise<{ text: string; businesses: Business[]; analysis: string }> => {
    try {
        // 1. Analyze Image using Gemini 2.5 Flash (Multimodal)
        const visionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: "Analyze this image. Describe the 'vibe', interior style, or food type in 1 short sentence. Then, generate a specific search query to find LOCAL places that match this aesthetic or serve this item. Format: JSON { \"analysis\": \"...\", \"query\": \"...\" }" }
                ]
            },
            config: {
                responseMimeType: 'application/json'
            }
        });

        const visionData = JSON.parse(visionResponse.text || "{}");
        const query = visionData.query || "cool places like this";
        const analysis = visionData.analysis || "Visual match found.";

        // 2. Perform Grounded Search with the generated query
        const searchResult = await searchLocalBusinesses(query, userLocation, weather);
        
        return {
            ...searchResult,
            analysis
        };
    } catch (error) {
        console.error("Vision Search Error", error);
        return { text: "Visual analysis failed.", businesses: [], analysis: "Error analyzing image." };
    }
};

export const generateVibeQuery = async (vibes: VibeState): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                You are a Vibe Translator. Convert these abstract parameters into a specific, evocative search query for finding a physical place (restaurant, bar, park, shop, venue).

                PARAMETERS:
                Entropy: ${vibes.entropy}% (0=Serene/Minimalist, 100=Chaotic/High Energy/Loud)
                Grit: ${vibes.grit}% (0=Polished/Luxury/Clean, 100=Raw/Industrial/Grunge)
                Epoch: ${vibes.epoch}% (0=Historic/Vintage/Retro, 100=Futuristic/Modern/Neon)
                Obscurity: ${vibes.obscurity}% (0=Mainstream/Famous, 100=Hidden/Secret/Local Only)

                TASK:
                Output JUST the search query string. Make it descriptive.
                Example for High Grit, High Obscurity: "Grungy dive bars hidden in alleyways"
                Example for Low Entropy, High Epoch: "Minimalist futuristic quiet cafes"
            `
        });
        return response.text?.trim() || "cool places";
    } catch (error) {
        return "hidden gems";
    }
};

export const compareBusinesses = async (b1: Business, b2: Business): Promise<ComparisonResult | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                Compare these two businesses based on their data.
                
                Business A: ${JSON.stringify(b1)}
                Business B: ${JSON.stringify(b2)}
                
                Task: Create a "Fight Card" style comparison.
                1. Pick a short, punchy Headline for the battle (e.g., "The Coffee Clash", "Date Night Duel").
                2. Write a 1-sentence Summary of the main trade-off.
                3. Compare 3 aspects (e.g., Vibe, Value, Social). Declare a winnerId for each (or null if tie).
                4. Declare an overall winnerId based on general appeal, and give a reason.
                
                Response JSON Schema:
                {
                    "headline": "string",
                    "summary": "string",
                    "winnerId": "string | null",
                    "winnerReason": "string",
                    "aspects": [
                        { "name": "string", "winnerId": "string | null", "description": "string" }
                    ]
                }
            `,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        return JSON.parse(response.text || "null");
    } catch (error) {
        console.error("Comparison Error", error);
        return null;
    }
};

export const generateConversationAudio = async (business: Business): Promise<ArrayBuffer | null> => {
    try {
        const prompt = `
            Generate a short, rapid-fire, natural conversation (approx 30-40 words total) between two friends, Alex and Jordan.
            They are discussing whether to go to "${business.name}" which is a ${business.types?.[0]}.
            
            Context:
            Vibe: ${business.vibe}
            Description: ${business.description}
            Rating: ${business.rating} stars.
            
            Tone: Casual, urban, slightly opinionated. Use slang.
            
            Script Format:
            Alex: [Line]
            Jordan: [Line]
            Alex: [Line]
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                            { speaker: 'Jordan', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                        ]
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        
        return decodeBase64(base64Audio).buffer;

    } catch (error) {
        console.error("Eavesdrop generation failed", error);
        return null;
    }
};

export const searchLocalBusinesses = async (
  query: string, 
  userLocation: Coordinates | null,
  weather?: WeatherState
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
    const weatherContext = weather ? getWeatherDescription(weather) : "Unknown";

    // STEP 1: Grounded Search (Real Data)
    // We add context to the query implicitly for the grounding model to find better candidates
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
