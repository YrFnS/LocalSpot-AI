import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import config from '../vercel.json' with { type: 'json' };

const [viteConfig, aiClient, liveSession] = await Promise.all([
  readFile(new URL('../vite.config.ts', import.meta.url), 'utf8'),
  readFile(new URL('../features/ai/client.ts', import.meta.url), 'utf8'),
  readFile(new URL('../features/live/useLiveSession.ts', import.meta.url), 'utf8'),
]);

test('Vercel serves client routes without migrating environment variables', () => {
  assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/index.html' }]);
  assert.equal(config.env, undefined);
  assert.equal(config.build?.env, undefined);
});

test('provider credentials cannot be bundled into the client', () => {
  assert.doesNotMatch(viteConfig, /loadEnv|GEMINI_API_KEY|process\.env/);
  assert.match(aiClient, /isAiConfigured = false/);
  assert.doesNotMatch(liveSession, /new GoogleGenAI/);
});
