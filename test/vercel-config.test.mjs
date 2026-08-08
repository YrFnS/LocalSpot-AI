import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));

test('Vercel serves client routes without migrating environment variables', () => {
  assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/index.html' }]);
  assert.equal(config.env, undefined);
  assert.equal(config.build?.env, undefined);
});
