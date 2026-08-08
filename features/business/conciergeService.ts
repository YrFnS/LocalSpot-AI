import type { Business } from "../../types";
import { notifyOpenRouterError, openRouterChat } from "../ai/openrouter.mjs";

export const askBusinessQuestion = async (business: Business, question: string): Promise<string> => {
  try {
    return await openRouterChat([{
      role: "user",
      content: `Business: ${business.name}. Details: ${JSON.stringify(business)}. Question: "${question}". Answer concisely as a local guide.`,
    }]);
  } catch (error) {
    return notifyOpenRouterError(error);
  }
};
