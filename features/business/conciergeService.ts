
import { ai } from "../../services/aiClient";
import { Business } from "../../types";

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
