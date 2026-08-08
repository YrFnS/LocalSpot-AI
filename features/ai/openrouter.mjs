export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

const API_KEY_STORAGE = "localspot.openrouter.apiKey";
const MODEL_STORAGE = "localspot.openrouter.model";

const browserStorage = () => {
  if (typeof window === "undefined") throw new Error("Browser storage is unavailable.");
  return window.localStorage;
};

export function loadOpenRouterSettings(storage = browserStorage()) {
  return {
    apiKey: (storage.getItem(API_KEY_STORAGE) || "").trim(),
    model: (storage.getItem(MODEL_STORAGE) || "").trim(),
  };
}

export function saveOpenRouterApiKey(apiKey, storage = browserStorage()) {
  const value = apiKey.trim();
  if (value) storage.setItem(API_KEY_STORAGE, value);
  else storage.removeItem(API_KEY_STORAGE);
}

export function clearOpenRouterApiKey(storage = browserStorage()) {
  storage.removeItem(API_KEY_STORAGE);
}

export function saveOpenRouterModel(model, storage = browserStorage()) {
  const value = model.trim();
  if (value) storage.setItem(MODEL_STORAGE, value);
  else storage.removeItem(MODEL_STORAGE);
}

export function isOpenRouterConfigured(storage) {
  try {
    const { apiKey, model } = loadOpenRouterSettings(storage || browserStorage());
    return Boolean(apiKey && model);
  } catch {
    return false;
  }
}

export function parseModelCatalog(payload) {
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error("OpenRouter returned an invalid model catalog. Enter a model ID manually.");
  }

  return payload.data.flatMap((item) => {
    if (!item || typeof item.id !== "string" || !item.id.trim()) return [];
    const contextLength = Number(item.context_length);
    const promptPrice = item.pricing?.prompt;
    const completionPrice = item.pricing?.completion;
    return [{
      id: item.id.trim(),
      name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : item.id.trim(),
      description: typeof item.description === "string" ? item.description : "",
      contextLength: Number.isFinite(contextLength) && contextLength > 0 ? contextLength : null,
      pricing: {
        prompt: typeof promptPrice === "string" || typeof promptPrice === "number" ? String(promptPrice) : null,
        completion: typeof completionPrice === "string" || typeof completionPrice === "number" ? String(completionPrice) : null,
      },
    }];
  });
}

export function isFreeModel(model) {
  const prompt = Number(model.pricing?.prompt);
  const completion = Number(model.pricing?.completion);
  return model.pricing?.prompt != null && model.pricing?.completion != null && prompt === 0 && completion === 0;
}

export function searchModels(models, query, freeOnly = false) {
  const needle = query.trim().toLowerCase();
  return models.filter((model) => {
    if (freeOnly && !isFreeModel(model)) return false;
    return !needle || `${model.name} ${model.id} ${model.description}`.toLowerCase().includes(needle);
  });
}

export function selectModelId(value, models = []) {
  const requested = value.trim();
  if (!requested) throw new Error("Select a model before using AI features.");
  return models.find((model) => model.id === requested)?.id || requested;
}

export async function fetchOpenRouterModels({ refresh = false, fetchImpl = fetch } = {}) {
  let response;
  try {
    response = await fetchImpl(OPENROUTER_MODELS_URL, { cache: refresh ? "reload" : "default" });
  } catch {
    throw new Error("Could not load OpenRouter models. Check your connection or enter a model ID manually.");
  }
  if (!response.ok) {
    throw new Error(`Could not load OpenRouter models (HTTP ${response.status}). Enter a model ID manually.`);
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("OpenRouter returned an invalid model catalog. Enter a model ID manually.");
  }
  return parseModelCatalog(payload);
}

export function createChatCompletionRequest({ apiKey, model, messages }) {
  if (!apiKey?.trim()) throw new Error("Add your OpenRouter API key in AI Settings before using AI features.");
  if (!model?.trim()) throw new Error("Select an OpenRouter model in AI Settings before using AI features.");
  if (!Array.isArray(messages) || messages.length === 0) throw new Error("The AI request had no messages.");

  return {
    url: OPENROUTER_CHAT_URL,
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: model.trim(), messages }),
    },
  };
}

export function redactOpenRouterError(value, apiKey = "") {
  let message = value instanceof Error ? value.message : String(value || "OpenRouter request failed.");
  if (apiKey) message = message.split(apiKey).join("[redacted]");
  message = message.replace(/Bearer\s+[^\s"']+/gi, "Bearer [redacted]");
  return message.slice(0, 300);
}

export function notifyOpenRouterError(error) {
  let key = "";
  try { key = loadOpenRouterSettings().apiKey; } catch {}
  const message = redactOpenRouterError(error, key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("localspot:ai-error", { detail: message }));
  }
  return message;
}

export async function openRouterChat(messages, { fetchImpl = fetch, storage } = {}) {
  const { apiKey, model } = loadOpenRouterSettings(storage || browserStorage());
  const request = createChatCompletionRequest({ apiKey, model, messages });
  let response;
  try {
    response = await fetchImpl(request.url, request.init);
  } catch {
    throw new Error("OpenRouter could not be reached. Check your connection and try again.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`OpenRouter returned a malformed response (HTTP ${response.status}). Try another model.`);
  }

  if (!response.ok) {
    const detail = redactOpenRouterError(payload?.error?.message || "", apiKey);
    if (response.status === 401) throw new Error("OpenRouter rejected the saved API key. Clear it and add a valid key.");
    if (response.status === 429) throw new Error("OpenRouter rate limit or credit limit reached. Check your OpenRouter account.");
    if (response.status === 404) throw new Error("The selected OpenRouter model is unavailable. Choose another model in AI Settings.");
    throw new Error(`OpenRouter request failed (HTTP ${response.status})${detail ? `: ${detail}` : "."}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenRouter returned no usable text. Try another model.");
  }
  return content.trim();
}

export function parseJsonResponse(content) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("The selected model returned invalid JSON. Try the action again or choose another model.");
  }
}
