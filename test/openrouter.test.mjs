import assert from "node:assert/strict";
import test from "node:test";
import {
  OPENROUTER_CHAT_URL,
  clearOpenRouterApiKey,
  createChatCompletionRequest,
  isFreeModel,
  loadOpenRouterSettings,
  parseModelCatalog,
  redactOpenRouterError,
  saveOpenRouterApiKey,
  saveOpenRouterModel,
  searchModels,
  selectModelId,
} from "../features/ai/openrouter.mjs";

const storage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

const catalog = parseModelCatalog({
  data: [
    { id: "vendor/free-model", name: "Free Model", description: "Fast", context_length: 32000, pricing: { prompt: "0", completion: "0" } },
    { id: "vendor/paid-model", name: "Paid Model", description: "Deep reasoning", context_length: "64000", pricing: { prompt: "0.000001", completion: "0.000002" } },
    { id: "", name: "Invalid" },
  ],
});

test("model catalog parsing, search, free filter, and exact selection", () => {
  assert.equal(catalog.length, 2);
  assert.equal(catalog[0].contextLength, 32000);
  assert.deepEqual(searchModels(catalog, "reasoning").map((model) => model.id), ["vendor/paid-model"]);
  assert.deepEqual(searchModels(catalog, "", true).map((model) => model.id), ["vendor/free-model"]);
  assert.equal(isFreeModel(catalog[0]), true);
  assert.equal(selectModelId("vendor/paid-model", catalog), "vendor/paid-model");
  assert.equal(selectModelId("manual/exact-id", catalog), "manual/exact-id");
  assert.throws(() => selectModelId("", catalog), /Select a model/);
  assert.throws(() => parseModelCatalog({ data: null }), /invalid model catalog/);
});

test("browser storage saves and clears the key without exposing it in errors", () => {
  const fakeStorage = storage();
  const placeholder = "unit-test-placeholder";
  saveOpenRouterApiKey(placeholder, fakeStorage);
  saveOpenRouterModel("vendor/paid-model", fakeStorage);
  assert.deepEqual(loadOpenRouterSettings(fakeStorage), { apiKey: placeholder, model: "vendor/paid-model" });
  const redacted = redactOpenRouterError(`Bearer ${placeholder} rejected: ${placeholder}`, placeholder);
  assert.doesNotMatch(redacted, new RegExp(placeholder));
  assert.match(redacted, /redacted/);
  clearOpenRouterApiKey(fakeStorage);
  assert.equal(loadOpenRouterSettings(fakeStorage).apiKey, "");
});

test("request construction uses the exact model and keeps credentials out of URL and body", () => {
  const request = createChatCompletionRequest({
    apiKey: "unit-test-placeholder",
    model: "vendor/paid-model",
    messages: [{ role: "user", content: "hello" }],
  });
  assert.equal(request.url, OPENROUTER_CHAT_URL);
  assert.equal(new URL(request.url).search, "");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.headers.Authorization, "Bearer unit-test-placeholder");
  assert.deepEqual(JSON.parse(request.init.body), {
    model: "vendor/paid-model",
    messages: [{ role: "user", content: "hello" }],
  });
  assert.doesNotMatch(request.init.body, /unit-test-placeholder/);
  assert.throws(() => createChatCompletionRequest({ apiKey: "", model: "vendor/paid-model", messages: [{ role: "user", content: "hello" }] }), /AI Settings/);
  assert.throws(() => createChatCompletionRequest({ apiKey: "x", model: "", messages: [{ role: "user", content: "hello" }] }), /Select an OpenRouter model/);
});
