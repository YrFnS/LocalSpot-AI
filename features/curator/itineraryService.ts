import type { Business, Itinerary, ItineraryItem } from "../../types";
import { notifyOpenRouterError, openRouterChat, parseJsonResponse } from "../ai/openrouter.mjs";

export const generateItinerary = async (prompt: string, contextBusinesses: Business[]): Promise<Itinerary | null> => {
  try {
    const businessContext = contextBusinesses
      .slice(0, 15)
      .map((business) => `ID: ${business.id}, Name: ${business.name}, Type: ${business.types?.[0]}, Vibe: ${business.vibe}, Rating: ${business.rating}`)
      .join("\n");
    const content = await openRouterChat([{
      role: "system",
      content: "You are The Curator, a concise local itinerary planner. Prefer provided business IDs, keep the route logical, and return only valid JSON.",
    }, {
      role: "user",
      content: `Request: "${prompt}"\nBusinesses:\n${businessContext}\nReturn {"title":string,"totalCostEstimate":string,"items":[{"timeOffset":string,"title":string,"description":string,"businessId":string|null,"type":"FOOD"|"ACTIVITY"|"DRINK"|"OTHER"}]}.`,
    }]);
    const data = parseJsonResponse(content) as { title?: unknown; totalCostEstimate?: unknown; items?: unknown };
    if (!data || typeof data.title !== "string" || !Array.isArray(data.items)) {
      throw new Error("The selected model returned an incomplete itinerary. Try another model.");
    }
    const items: ItineraryItem[] = data.items.flatMap((item: any) => {
      if (!item || typeof item.title !== "string" || typeof item.description !== "string") return [];
      return [{
        ...item,
        id: crypto.randomUUID(),
        business: item.businessId ? contextBusinesses.find((business) => business.id === item.businessId) : undefined,
      }];
    });
    if (!items.length) throw new Error("The selected model returned no usable itinerary stops. Try another model.");
    return {
      title: data.title,
      totalCostEstimate: typeof data.totalCostEstimate === "string" ? data.totalCostEstimate : "—",
      items,
    };
  } catch (error) {
    notifyOpenRouterError(error);
    return null;
  }
};
