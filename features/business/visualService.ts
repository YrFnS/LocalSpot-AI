
import { ai } from "../ai/client";

export const generateMenuVisual = async (
  itemName: string,
  itemDesc: string,
  vibe: string
): Promise<string | null> => {
  try {
    // MODIFIED: Instead of generating a fake image, we search for a REAL one.
    const prompt = `
      Find a real, existing image URL for the food item: "${itemName}" (${itemDesc}).
      
      Task:
      1. Use Google Search to find a high-quality photo of this specific dish or a very similar real dish served at a restaurant.
      2. Return ONLY the direct image URL as a string.
      3. BLOCK STOCK SITES: Do NOT use Unsplash, Pexels, or Pixabay.
      4. Do NOT generate an image. Only return a URL found on the web.
      5. Output format: JSON { "imageUrl": "..." }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using text model with tools, not image generation model
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json.imageUrl || null;

  } catch (error) {
    console.error("Menu Visual Search Error:", error);
    return null;
  }
};

export const generateHistoryVisual = async (
    visualPrompt: string,
    era: string
): Promise<string | null> => {
    try {
        // MODIFIED: Search for real historical archives instead of generating fake vintage photos.
        const prompt = `
            Find a REAL historical photograph from the ${era} related to: ${visualPrompt}.
            
            Task:
            1. Search for actual archival photos of this location or neighborhood from that time period.
            2. Return ONLY the direct image URL of a real historical photo.
            3. Do NOT generate a fake vintage image.
            4. Output format: JSON { "imageUrl": "..." }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: 'application/json'
            }
        });

        const json = JSON.parse(response.text || "{}");
        return json.imageUrl || null;

    } catch (error) {
        console.error("History Visual Search Error:", error);
        return null;
    }
};
