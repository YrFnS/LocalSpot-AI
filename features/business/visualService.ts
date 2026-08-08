import { notifyOpenRouterError, openRouterChat, parseJsonResponse } from "../ai/openrouter.mjs";

const readImageUrl = (content: string) => {
  const data = parseJsonResponse(content) as { imageUrl?: unknown };
  if (typeof data.imageUrl !== "string") throw new Error("The selected model returned no usable image URL.");
  if (!URL.canParse(data.imageUrl) || !data.imageUrl.toLowerCase().startsWith("https://")) {
    throw new Error("The selected model returned an unsafe image URL.");
  }
  return data.imageUrl;
};

export const generateMenuVisual = async (itemName: string, itemDesc: string, vibe: string): Promise<string | null> => {
  try {
    const content = await openRouterChat([{
      role: "user",
      content: `If you know a real direct HTTPS image URL for ${itemName} (${itemDesc}, ${vibe}), return only JSON {"imageUrl":"..."}. Never invent a URL; return {"imageUrl":null} when uncertain.`,
    }]);
    return readImageUrl(content);
  } catch (error) {
    notifyOpenRouterError(error);
    return null;
  }
};

export const generateHistoryVisual = async (visualPrompt: string, era: string): Promise<string | null> => {
  try {
    const content = await openRouterChat([{
      role: "user",
      content: `If you know a real archival direct HTTPS image URL from ${era} related to ${visualPrompt}, return only JSON {"imageUrl":"..."}. Never invent a URL; return {"imageUrl":null} when uncertain.`,
    }]);
    return readImageUrl(content);
  } catch (error) {
    notifyOpenRouterError(error);
    return null;
  }
};
