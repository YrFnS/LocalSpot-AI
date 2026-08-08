import type { Business, ComparisonResult } from "../../types";
import { notifyOpenRouterError, openRouterChat, parseJsonResponse } from "../ai/openrouter.mjs";

export const compareBusinesses = async (first: Business, second: Business): Promise<ComparisonResult | null> => {
  try {
    const content = await openRouterChat([{
      role: "user",
      content: `Compare these businesses as a concise fight card. Return only JSON with headline, summary, winnerId (string or null), winnerReason, and aspects (array of {name, winnerId, description}).\nBusiness A: ${JSON.stringify(first)}\nBusiness B: ${JSON.stringify(second)}`,
    }]);
    const data = parseJsonResponse(content) as Partial<ComparisonResult>;
    if (!data || typeof data.headline !== "string" || typeof data.summary !== "string" || !Array.isArray(data.aspects)) {
      throw new Error("The selected model returned incomplete comparison data. Try another model.");
    }
    return data as ComparisonResult;
  } catch (error) {
    notifyOpenRouterError(error);
    return null;
  }
};
