import type { Business } from "../../types";
import { notifyOpenRouterError, openRouterChat, parseJsonResponse } from "../ai/openrouter.mjs";

export interface HistoricalData {
  summary: string;
  era: string;
  visualPrompt: string;
}

export const getHistoricalContext = async (business: Business): Promise<HistoricalData | null> => {
  try {
    const content = await openRouterChat([{
      role: "user",
      content: `Research the history of "${business.name}" at "${business.address}". If exact building history is unknown, clearly label a likely neighborhood-era inference. Return only JSON with string fields summary, era, and visualPrompt.`,
    }]);
    const data = parseJsonResponse(content) as Partial<HistoricalData>;
    if (!data || typeof data.summary !== "string" || typeof data.era !== "string" || typeof data.visualPrompt !== "string") {
      throw new Error("The selected model returned incomplete historical data. Try another model.");
    }
    return data as HistoricalData;
  } catch (error) {
    notifyOpenRouterError(error);
    return null;
  }
};
