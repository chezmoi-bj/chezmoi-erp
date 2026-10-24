/**
 * Chezmoi ERP - IndexedDB Local Persistence Engine
 * Fournit une persistance robuste hors-ligne pour PWA, Mobile, PC et Web.
 * Sauvegarde instantanée en local et synchronisation vers MySQL Cloud Hostinger.
 */

import { PropertyRecord, LegalDocument } from '../types';
import { SyncQueueItem } from './sync_engine';

const DB_NAME = 'chezmoi_erp_offline_db';
const DB_VERSION = 1;

const STORES = {
  PROPERTIES: 'properties',
  SYNC_QUEUE: 'sync_queue',
  DOCUMENTS: 'documents',
} as const;

let dbInstance: IDBDatabase | null = null;

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Initialise la base de données locale IndexedDB
 */
export async function getDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAvailable()) return null;
  if (dbInstance) return dbInstance;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.PROPERTIES)) {
          db.createObjectStore(STORES.PROPERTIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
          db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = () => {
        console.warn('[IndexedDB] Impossible d\'ouvrir la base locale. Utilisation du fallback mémoire/localStorage.');
        resolve(null);
      };
    } catch (e) {
      console.warn('[IndexedDB] Erreur initialisation:', e);
      resolve(null);
    }
  });
}

/**
 * Sauvegarde locale instantanée d'un bien recensé (Offline-first)
 */
export async function saveLocalProperty(property: PropertyRecord): Promise<void> {
  // 1. Sauvegarde IndexedDB
  const db = await getDB();
  if (db) {
    try {
      const tx = db.transaction(STORES.PROPERTIES, 'readwrite');
      const store = tx.objectStore(STORES.PROPERTIES);
      store.put(property);
    } catch (e) {
      console.error('[IndexedDB] Erreur sauvegarde bien:', e);
    }
  }

  // 2. Sauvegarde miroir localStorage pour résilience maximale
  try {
    const raw = localStorage.getItem('chezmoi_offline_properties');
    const list: PropertyRecord[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(p => p.id === property.id);
    if (idx !== -1) {
      list[idx] = property;
    } else {
      list.unshift(property);
    }
    localStorage.setItem('chezmoi_offline_properties', JSON.stringify(list));
  } catch (e) {
    // Quota ou environnement restreint
  }
}

/**
 * Récupère tous les biens sauvegardés localement
 */
export async function getLocalProperties(): Promise<PropertyRecord[]> {
  const db = await getDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.PROPERTIES, 'readonly');
        const store = tx.objectStore(STORES.PROPERTIES);
        const request = store.getAll();

        request.onsuccess = () => {
          const results: PropertyRecord[] = request.result || [];
          if (results.length > 0) {
            resolve(results);
            return;
          }
          // Fallback localStorage si IndexedDB vide
          fallbackLocalStorage();
        };

        request.onerror = () => fallbackLocalStorage();
      } catch (e) {
        fallbackLocalStorage();
      }

      function fallbackLocalStorage() {
        try {
          const raw = localStorage.getItem('chezmoi_offline_properties');
          resolve(raw ? JSON.parse(raw) : []);
        } catch {
          resolve([]);
        }
      }
    });
  }

  try {
    const raw = localStorage.getItem('chezmoi_offline_properties');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde un élément dans la file d'attente locale de synchronisation
 */
export async function saveLocalSyncItem(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  if (db) {
    try {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      store.put(item);
    } catch (e) {
      console.error('[IndexedDB] Erreur sync item:', e);
    }
  }

  try {
    const raw = localStorage.getItem('chezmoi_sync_queue');
    const queue: SyncQueueItem[] = raw ? JSON.parse(raw) : [];
    const idx = queue.findIndex(q => q.id === item.id);
    if (idx !== -1) {
      queue[idx] = item;
    } else {
      queue.unshift(item);
    }
    localStorage.setItem('chezmoi_sync_queue', JSON.stringify(queue));
  } catch (e) {
    // Quota
  }
}

/**
 * Supprime un élément de la file d'attente une fois synchronisé avec succès
 */
export async function removeLocalSyncItem(id: string): Promise<void> {
  const db = await getDB();
  if (db) {
    try {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      store.delete(id);
    } catch (e) {
      // Ignorer
    }
  }

  try {
    const raw = localStorage.getItem('chezmoi_sync_queue');
    if (raw) {
      const queue: SyncQueueItem[] = JSON.parse(raw);
      localStorage.setItem('chezmoi_sync_queue', JSON.stringify(queue.filter(q => q.id !== id)));
    }
  } catch (e) {
    // Ignorer
  }
}

/**
 * Récupère la file d'attente de synchronisation locale
 */
export async function getLocalSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  try {
    const raw = localStorage.getItem('chezmoi_sync_queue');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde locale d'un document légal / GED
 */
export async function saveLocalDocument(doc: LegalDocument): Promise<void> {
  const db = await getDB();
  if (db) {
    try {
      const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORES.DOCUMENTS);
      store.put(doc);
    } catch (e) {
      console.error('[IndexedDB] Erreur doc:', e);
    }
  }

  try {
    const raw = localStorage.getItem('chezmoi_offline_documents');
    const docs: LegalDocument[] = raw ? JSON.parse(raw) : [];
    docs.unshift(doc);
    localStorage.setItem('chezmoi_offline_documents', JSON.stringify(docs));
  } catch {
    // Quota
  }
}

/**
 * Récupère tous les documents locaux
 */
export async function getLocalDocuments(): Promise<LegalDocument[]> {
  const db = await getDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.DOCUMENTS, 'readonly');
        const store = tx.objectStore(STORES.DOCUMENTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  try {
    const raw = localStorage.getItem('chezmoi_offline_documents');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
