
import { ai } from "../../services/aiClient";
import { Coordinates, WeatherState, VibeState, Business } from "../../types";
import { getWeatherDescription } from "../context/weatherService";
import { searchLocalBusinesses } from "./searchService";

export const getAiSuggestions = async (
    userLocation: Coordinates | null,
    weather?: WeatherState
): Promise<string[]> => {
    try {
        const timeContext = new Date().toLocaleString('en-US', { 
            weekday: 'long', hour: 'numeric', minute: 'numeric' 
        });
        const weatherContext = weather ? getWeatherDescription(weather) : "Unknown";
        
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

        // 2. Perform Grounded Search (Delegated to searchService)
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
