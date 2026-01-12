
import { GoogleGenAI } from "@google/genai";

// Shared instance to be used across all services
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
