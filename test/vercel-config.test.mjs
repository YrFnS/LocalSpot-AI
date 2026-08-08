import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import config from "../vercel.json" with { type: "json" };

const [viteConfig, openRouterClient] = await Promise.all([
  readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
  readFile(new URL("../features/ai/openrouter.mjs", import.meta.url), "utf8"),
]);

test("Vercel serves client routes without deployment credentials", () => {
  assert.deepEqual(config.rewrites, [{ source: "/(.*)", destination: "/index.html" }]);
  assert.equal(config.env, undefined);
  assert.equal(config.build?.env, undefined);
  assert.doesNotMatch(viteConfig, /loadEnv|API_KEY|process\.env/);
});

test("OpenRouter credentials are read from browser storage and used only in an Authorization header", () => {
  assert.match(openRouterClient, /window\.localStorage/);
  assert.match(openRouterClient, /Authorization: `Bearer/);
  assert.doesNotMatch(openRouterClient, /[?&](?:api_?key|key)=/i);
  assert.doesNotMatch(openRouterClient, /console\.(?:log|error|warn)/);
});
