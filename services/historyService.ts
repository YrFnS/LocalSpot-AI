
import { ai } from "./aiClient";
import { Business } from "../types";

export interface HistoricalData {
    summary: string;
    era: string;
    visualPrompt: string;
}

export const getHistoricalContext = async (business: Business): Promise<HistoricalData | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `
                Research the history of the location: "${business.name}" at "${business.address}".
                
                If the exact building history is unknown, infer the likely history of this neighborhood/district during its peak historical era (e.g., 1920s, 1950s, 1890s).
                
                Task:
                1. Identify a specific historical "Era" (e.g. "Roaring 20s", "Post-War 1950s").
                2. Write a 2-sentence "Summary" of what this location used to be or the vibe of the area then.
                3. Create a "VisualPrompt" to generate a photo of the building exterior from that time.
                
                Output JSON:
                {
                    "summary": "string",
                    "era": "string",
                    "visualPrompt": "string"
                }
            `,
            config: {
                responseMimeType: 'application/json'
            }
        });

        return JSON.parse(response.text || "null");
    } catch (error) {
        console.error("History Service Error:", error);
        return null;
    }
};
