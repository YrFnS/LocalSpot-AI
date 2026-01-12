
import { ai } from "../ai/client";
import { Business } from "../../types";

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
