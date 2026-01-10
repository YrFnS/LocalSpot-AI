
import { Business, Coordinates, WeatherState, ComparisonResult, VibeState } from "../types";
import { getWeatherDescription } from "./weatherService";
import { searchLocalBusinesses } from "./searchService";
import { ai } from "./aiClient";

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

export interface SentimentAnalysis {
    summary: string;
    keywords: string[];
    sentimentScore: number; // 0-100
    warnings: string[];
}

export const analyzeSentiment = async (reviews: Business['reviews']): Promise<SentimentAnalysis | null> => {
    if (!reviews || reviews.length === 0) return null;
    
    try {
        const reviewText = reviews.slice(0, 10).map(r => r.text.text).join("\n");
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                Analyze these reviews for a local business.
                Reviews:
                ${reviewText}

                Task:
                1. Write a 1-sentence tactical summary of the consensus.
                2. Extract 3-5 distinct keywords (e.g., "Loud", "Tasty", "Slow Service").
                3. Rate the sentiment from 0 (Negative) to 100 (Positive).
                4. Identify any warnings/complaints (if any).

                Response JSON Schema:
                {
                    "summary": "string",
                    "keywords": ["string"],
                    "sentimentScore": number,
                    "warnings": ["string"]
                }
            `,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        return JSON.parse(response.text || "null");
    } catch (error) {
        console.error("Sentiment Analysis Error", error);
        return null;
    }
};
