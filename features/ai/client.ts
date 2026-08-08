
import type { GoogleGenAI } from "@google/genai";

export const isAiConfigured = false;

// Vercel has no provider credentials by design; keep the UI available while AI calls fail closed.
export const ai = new Proxy({} as GoogleGenAI, {
  get() {
    throw new Error("AI features are not configured.");
  },
});
