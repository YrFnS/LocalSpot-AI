import type { Business, Coordinates, VibeState, WeatherState } from "../../types";
import { isOpenRouterConfigured, openRouterChat, parseJsonResponse } from "../ai/openrouter.mjs";
import { getWeatherDescription } from "../context/weatherService";
import { searchLocalBusinesses } from "./searchService";

const fallbackSuggestions = ["Best coffee nearby", "Lunch spots", "Parks", "Dinner dates", "Cocktail bars"];

export const getAiSuggestions = async (userLocation: Coordinates | null, weather?: WeatherState): Promise<string[]> => {
  if (!isOpenRouterConfigured()) return fallbackSuggestions;
  try {
    const content = await openRouterChat([{
      role: "user",
      content: `Generate five short local search queries for location ${userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : "unknown"}, time ${new Date().toLocaleString("en-US")}, and weather ${weather ? getWeatherDescription(weather) : "unknown"}. Return only a JSON array of strings.`,
    }]);
    const data = parseJsonResponse(content);
    if (!Array.isArray(data) || !data.every((item) => typeof item === "string")) throw new Error("The selected model returned invalid search suggestions.");
    return data.slice(0, 5);
  } catch {
    return fallbackSuggestions;
  }
};

export const analyzeImageAndSearch = async (
  base64Image: string,
  userLocation: Coordinates | null,
  weather?: WeatherState,
): Promise<{ text: string; businesses: Business[]; analysis: string }> => {
  const content = await openRouterChat([{
    role: "user",
    content: [
      { type: "text", text: "Describe this image's vibe, interior style, or food in one short sentence and create a local-place search query. Return only JSON with analysis and query string fields." },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
    ],
  }]);
  const data = parseJsonResponse(content) as { analysis?: unknown; query?: unknown };
  if (!data || typeof data.analysis !== "string" || typeof data.query !== "string") {
    throw new Error("The selected model returned invalid visual analysis. Try a vision-capable model.");
  }
  const searchResult = await searchLocalBusinesses(data.query, userLocation, weather);
  return { ...searchResult, analysis: data.analysis };
};

export const generateVibeQuery = (vibes: VibeState): Promise<string> => openRouterChat([{
  role: "user",
  content: `Convert these parameters into one specific local-place search query. Entropy ${vibes.entropy}/100, grit ${vibes.grit}/100, epoch ${vibes.epoch}/100, obscurity ${vibes.obscurity}/100. Return only the query, without quotes or explanation.`,
}]);
