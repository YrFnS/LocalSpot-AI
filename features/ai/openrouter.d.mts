export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  contextLength: number | null;
  pricing: { prompt: string | null; completion: string | null };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

export const OPENROUTER_CHAT_URL: string;
export const OPENROUTER_MODELS_URL: string;
export function loadOpenRouterSettings(storage?: StorageLike): { apiKey: string; model: string };
export function saveOpenRouterApiKey(apiKey: string, storage?: StorageLike): void;
export function clearOpenRouterApiKey(storage?: StorageLike): void;
export function saveOpenRouterModel(model: string, storage?: StorageLike): void;
export function isOpenRouterConfigured(storage?: StorageLike): boolean;
export function parseModelCatalog(payload: unknown): OpenRouterModel[];
export function isFreeModel(model: OpenRouterModel): boolean;
export function searchModels(models: OpenRouterModel[], query: string, freeOnly?: boolean): OpenRouterModel[];
export function selectModelId(value: string, models?: OpenRouterModel[]): string;
export function fetchOpenRouterModels(options?: { refresh?: boolean; fetchImpl?: typeof fetch }): Promise<OpenRouterModel[]>;
export function createChatCompletionRequest(input: { apiKey: string; model: string; messages: OpenRouterMessage[] }): { url: string; init: RequestInit };
export function redactOpenRouterError(value: unknown, apiKey?: string): string;
export function notifyOpenRouterError(error: unknown): string;
export function openRouterChat(messages: OpenRouterMessage[], options?: { fetchImpl?: typeof fetch; storage?: StorageLike }): Promise<string>;
export function parseJsonResponse(content: string): unknown;
