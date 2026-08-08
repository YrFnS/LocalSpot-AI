import type { Business, Coordinates, WeatherState } from "../../types";
import { openRouterChat, parseJsonResponse } from "../ai/openrouter.mjs";
import { mapAiResponseToBusiness } from "../business/businessMapper";
import { getWeatherDescription } from "../context/weatherService";

export const getFeaturedBusinesses = async (userLocation: Coordinates | null, weather?: WeatherState): Promise<Business[]> => {
  const { businesses } = await searchLocalBusinesses("trending spots right now", userLocation, weather);
  return businesses.slice(0, 15);
};

export const searchLocalBusinesses = async (
  query: string,
  userLocation: Coordinates | null,
  weather?: WeatherState,
): Promise<{ text: string; businesses: Business[] }> => {
  const location = userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : "the user's local area";
  const weatherContext = weather ? getWeatherDescription(weather) : "unknown";
  const content = await openRouterChat([{
    role: "system",
    content: "You are a careful local guide. Never invent URLs. If exact coordinates or facts are uncertain, use null. Return only valid JSON.",
  }, {
    role: "user",
    content: `Find up to 15 relevant businesses for "${query}" near ${location}. Current time: ${new Date().toLocaleString("en-US")}. Weather: ${weatherContext}. Return a JSON array with: name, description, type, price, address, latitude, longitude, rating, ratingCount, vibe, bestFor (string array), openNow, matchScore, photoUri (absolute real URL or null), crowdLevel, waitEstimate, menuItems (array of {name,price,description,tags}), slots (array of {time,available}), and reviews (array of {user,text,rating}).`,
  }]);
  const parsed = parseJsonResponse(content);
  if (!Array.isArray(parsed)) throw new Error("The selected model returned an invalid business list. Try another model.");
  const usable = parsed.filter((item) => item && typeof item === "object" && typeof item.name === "string" && item.name.trim());
  if (!usable.length) throw new Error("The selected model returned no usable businesses. Try a different query or model.");
  return {
    text: content,
    businesses: usable.slice(0, 15).map((item, index) => mapAiResponseToBusiness(item, index, userLocation)),
  };
};
