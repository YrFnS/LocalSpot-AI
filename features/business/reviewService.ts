import type { Business } from "../../types";
import { notifyOpenRouterError, openRouterChat, parseJsonResponse } from "../ai/openrouter.mjs";

export interface SentimentAnalysis {
  summary: string;
  keywords: string[];
  sentimentScore: number;
  warnings: string[];
}

export const analyzeSentiment = async (reviews: Business["reviews"]): Promise<SentimentAnalysis | null> => {
  if (!reviews?.length) return null;

  try {
    const reviewText = reviews.slice(0, 10).map((review) => review.text.text).join("\n");
    const content = await openRouterChat([{
      role: "user",
      content: `Analyze these reviews. Return only JSON with summary (string), keywords (3-5 strings), sentimentScore (0-100 number), and warnings (string array).\n\n${reviewText}`,
    }]);
    const data = parseJsonResponse(content) as Partial<SentimentAnalysis>;
    if (!data || typeof data.summary !== "string" || !Array.isArray(data.keywords) || typeof data.sentimentScore !== "number" || !Array.isArray(data.warnings)) {
      throw new Error("The selected model returned incomplete sentiment data. Try another model.");
    }
    return data as SentimentAnalysis;
  } catch (error) {
    notifyOpenRouterError(error);
    return null;
  }
};
