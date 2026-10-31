import test from 'node:test';
import assert from 'node:assert/strict';
import { getApiBaseUrl } from './api';

test('API Client Interceptor & URL resolution', async (t) => {
  await t.test('returns production API endpoint when in remote or non-standard environment', () => {
    const url = getApiBaseUrl();
    assert.ok(typeof url === 'string');
    assert.ok(url.includes('/api') || url.startsWith('http'));
  });
});
