import { GoogleGenAI } from "@google/genai";
import { Business, Itinerary, ItineraryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateItinerary = async (
  prompt: string,
  contextBusinesses: Business[]
): Promise<Itinerary | null> => {
  try {
    const businessContext = contextBusinesses
      .slice(0, 15) // Limit context to top 15 results to save tokens
      .map(b => `ID: ${b.id}, Name: ${b.name}, Type: ${b.types?.[0]}, Vibe: ${b.vibe}, Rating: ${b.rating}`)
      .join('\n');

    const systemInstruction = `
      Role: You are 'The Curator', an expert lifestyle architect for LocalSpot.
      Task: Create a 3-4 stop itinerary based on the user's request.
      Constraint: 
      1. PRIORITIZE using businesses from the provided 'Context List' if they fit.
      2. If no context fits, suggest a generic activity (e.g. "Walk in the park").
      3. The flow must be logical (e.g. Activity -> Dinner -> Drinks).
      4. Return pure JSON.
    `;

    // Use Gemini 3 Pro for complex reasoning and planning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        User Request: "${prompt}"
        Context List:
        ${businessContext}

        Generate JSON Schema:
        {
            "title": "Creative Title for the Night",
            "totalCostEstimate": "$$$",
            "items": [
                {
                    "timeOffset": "6:00 PM",
                    "title": "Stop Name",
                    "description": "Short punchy reason why.",
                    "businessId": "ID from context OR null if generic",
                    "type": "FOOD | ACTIVITY | DRINK | OTHER"
                }
            ]
        }
      `,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: systemInstruction
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Hydrate businesses
    const hydratedItems: ItineraryItem[] = (data.items || []).map((item: any) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        business: item.businessId ? contextBusinesses.find(b => b.id === item.businessId) : undefined
    }));

    return {
        title: data.title || "Custom Plan",
        totalCostEstimate: data.totalCostEstimate || "$$",
        items: hydratedItems
    };

  } catch (error) {
    console.error("Itinerary Gen Error:", error);
    return null;
  }
};