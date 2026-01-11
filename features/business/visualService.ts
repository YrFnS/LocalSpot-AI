
import { ai } from "../../services/aiClient";

export const generateMenuVisual = async (
  itemName: string,
  itemDesc: string,
  vibe: string
): Promise<string | null> => {
  try {
    const prompt = `
      Professional food photography of ${itemName}.
      Description: ${itemDesc}.
      Context: Served in a ${vibe} restaurant setting.
      Style: High resolution, 4k, delicious, cinematic lighting, shallow depth of field.
      Do not include text in the image.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Menu Visual Gen Error:", error);
    return null;
  }
};

export const generateHistoryVisual = async (
    visualPrompt: string,
    era: string
): Promise<string | null> => {
    try {
        const prompt = `
            Old vintage photograph from the ${era}. 
            Subject: ${visualPrompt}. 
            Style: Sepia tone, film grain, scratches, slightly blurry edges, authentic historical aesthetic, 1900s photography. 
            Street view, exterior shot.
            No text, no watermarks.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("History Visual Gen Error:", error);
        return null;
    }
};
