
import { ai } from "../../services/aiClient";
import { Business, ComparisonResult } from "../../types";

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
