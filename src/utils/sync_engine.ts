/**
 * Chezmoi Immobilier - Offline Sync Engine Core Logic
 * Handles client-side offline queueing, exponential retry, and conflict resolution.
 */

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';

export type EntityType = 'property' | 'owner' | 'photo' | 'invoice' | 'document';

export interface SyncQueueItem<T = unknown> {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: T;
  localTimestamp: number;
  serverTimestamp?: number;
  syncStatus: SyncStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

export interface ConflictResolution<T> {
  resolved: T;
  strategy: 'client-wins' | 'server-wins' | 'merged';
}

/**
 * Calculates exponential backoff in milliseconds
 * Formula: baseDelay * 2^(retryCount) + jitter
 */
export function calculateBackoffDelay(
  retryCount: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000
): number {
  const exponential = baseDelayMs * Math.pow(2, retryCount);
  return Math.min(exponential, maxDelayMs);
}

/**
 * Enqueue a new mutation to the offline queue
 */
export function enqueueMutation<T>(
  queue: SyncQueueItem<T>[],
  entityType: EntityType,
  entityId: string,
  action: 'create' | 'update' | 'delete',
  payload: T,
  maxRetries: number = 5
): { updatedQueue: SyncQueueItem<T>[]; newItem: SyncQueueItem<T> } {
  // If there is already a pending mutation for this same entity, merge or replace it
  const existingIdx = queue.findIndex(
    item => item.entityId === entityId && item.entityType === entityType && item.syncStatus === 'pending'
  );

  const now = Date.now();
  const newItem: SyncQueueItem<T> = {
    id: `sync_${now}_${Math.random().toString(36).substring(2, 9)}`,
    entityType,
    entityId,
    action,
    payload,
    localTimestamp: now,
    syncStatus: 'pending',
    retryCount: 0,
    maxRetries,
  };

  if (existingIdx !== -1) {
    const updated = [...queue];
    // If the previous was create, keeping it as create with new payload is optimal
    const previous = updated[existingIdx];
    const resolvedAction = previous.action === 'create' ? 'create' : action;
    updated[existingIdx] = {
      ...newItem,
      action: resolvedAction,
      localTimestamp: now,
    };
    return { updatedQueue: updated, newItem: updated[existingIdx] };
  }

  return { updatedQueue: [newItem, ...queue], newItem };
}

/**
 * Updates status of an item in the sync queue
 */
export function updateQueueItemStatus<T>(
  queue: SyncQueueItem<T>[],
  itemId: string,
  status: SyncStatus,
  options?: { lastError?: string; serverTimestamp?: number; incrementRetry?: boolean }
): SyncQueueItem<T>[] {
  return queue.map(item => {
    if (item.id !== itemId) return item;
    const retryCount = options?.incrementRetry ? item.retryCount + 1 : item.retryCount;
    return {
      ...item,
      syncStatus: status,
      lastError: options?.lastError ?? item.lastError,
      serverTimestamp: options?.serverTimestamp ?? item.serverTimestamp,
      retryCount,
    };
  });
}

/**
 * Resolves conflict between local and server changes (Last-Write-Wins based on timestamps)
 */
export function resolveConflictLWW<T extends { updatedAt?: number }>(
  localData: T,
  serverData: T,
  localTimestamp: number,
  serverTimestamp: number
): ConflictResolution<T> {
  if (localTimestamp >= serverTimestamp) {
    return {
      resolved: localData,
      strategy: 'client-wins',
    };
  }
  return {
    resolved: serverData,
    strategy: 'server-wins',
  };
}
