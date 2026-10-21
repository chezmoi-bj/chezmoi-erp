import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBackoffDelay,
  enqueueMutation,
  updateQueueItemStatus,
  resolveConflictLWW,
} from './sync_engine.ts';
import type { SyncQueueItem } from './sync_engine.ts';

test('calculateBackoffDelay generates exponential values bounded by max', () => {
  assert.equal(calculateBackoffDelay(0, 1000, 30000), 1000);
  assert.equal(calculateBackoffDelay(1, 1000, 30000), 2000);
  assert.equal(calculateBackoffDelay(2, 1000, 30000), 4000);
  assert.equal(calculateBackoffDelay(5, 1000, 30000), 30000); // capped at 30s
});

test('enqueueMutation creates pending queue item and prepends it', () => {
  const initialQueue: SyncQueueItem[] = [];
  const { updatedQueue, newItem } = enqueueMutation(
    initialQueue,
    'property',
    'prop_123',
    'create',
    { title: 'Villa Duplex Fidjrosse' }
  );

  assert.equal(updatedQueue.length, 1);
  assert.equal(newItem.entityId, 'prop_123');
  assert.equal(newItem.entityType, 'property');
  assert.equal(newItem.syncStatus, 'pending');
  assert.equal(newItem.action, 'create');
});

test('enqueueMutation merges pending mutations for same entity', () => {
  const { updatedQueue: queue1 } = enqueueMutation(
    [],
    'property',
    'prop_123',
    'create',
    { title: 'Version 1' }
  );

  const { updatedQueue: queue2 } = enqueueMutation(
    queue1,
    'property',
    'prop_123',
    'update',
    { title: 'Version 2 with GPS' }
  );

  assert.equal(queue2.length, 1);
  assert.equal(queue2[0].action, 'create'); // Preserved original create
  assert.deepEqual(queue2[0].payload, { title: 'Version 2 with GPS' });
});

test('updateQueueItemStatus marks status and increments retries', () => {
  const { updatedQueue } = enqueueMutation(
    [],
    'photo',
    'photo_456',
    'create',
    { url: 'local_file_uri' }
  );
  const itemId = updatedQueue[0].id;

  const syncingQueue = updateQueueItemStatus(updatedQueue, itemId, 'syncing');
  assert.equal(syncingQueue[0].syncStatus, 'syncing');

  const failedQueue = updateQueueItemStatus(syncingQueue, itemId, 'failed', {
    lastError: 'HTTP 503 Server Unavailable',
    incrementRetry: true,
  });
  assert.equal(failedQueue[0].syncStatus, 'failed');
  assert.equal(failedQueue[0].retryCount, 1);
  assert.equal(failedQueue[0].lastError, 'HTTP 503 Server Unavailable');
});

test('resolveConflictLWW resolves to newer timestamp', () => {
  const local = { id: 'p1', price: 50000000, updatedAt: 2000 };
  const server = { id: 'p1', price: 45000000, updatedAt: 1000 };

  const res1 = resolveConflictLWW(local, server, 2000, 1000);
  assert.equal(res1.strategy, 'client-wins');
  assert.equal(res1.resolved.price, 50000000);

  const res2 = resolveConflictLWW(local, server, 500, 1500);
  assert.equal(res2.strategy, 'server-wins');
  assert.equal(res2.resolved.price, 45000000);
});
