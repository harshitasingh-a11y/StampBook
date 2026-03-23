/**
 * Asset cache using IndexedDB for offline support and faster loading.
 * Stores image/video blobs for seamless browsing without network lag.
 */

const DB_NAME = 'journal-assets';
const STORE_NAME = 'assets';
const DB_VERSION = 1;

interface CachedAsset {
  url: string;
  blob: Blob;
  cachedAt: number;
}

let db: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'url' });
      }
    };
  });
}

/**
 * Download and cache an asset (image or video).
 * Returns a blob URL for immediate use.
 */
export async function cacheAsset(url: string): Promise<string> {
  try {
    const database = await initDB();

    // Check if already cached
    const cached = await getFromCache(url);
    if (cached) {
      return URL.createObjectURL(cached);
    }

    // Download the asset
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const blob = await response.blob();

    // Store in IndexedDB
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const req = store.put({ url, blob, cachedAt: Date.now() });
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn(`Failed to cache asset ${url}:`, error);
    // Fall back to original URL if caching fails
    return url;
  }
}

/**
 * Retrieve cached asset blob.
 */
async function getFromCache(url: string): Promise<Blob | null> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedAsset | undefined;
        resolve(result?.blob ?? null);
      };
    });
  } catch (error) {
    console.warn(`Failed to retrieve cached asset ${url}:`, error);
    return null;
  }
}

/**
 * Get blob URL for an asset (cached or remote).
 */
export async function getAssetUrl(url: string): Promise<string> {
  const cached = await getFromCache(url);
  if (cached) {
    return URL.createObjectURL(cached);
  }
  return url;
}

/**
 * Clear all cached assets.
 */
export async function clearCache(): Promise<void> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics.
 */
export async function getCacheStats(): Promise<{ count: number; size: number }> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const countReq = store.count();
      countReq.onerror = () => reject(countReq.error);
      countReq.onsuccess = async () => {
        const count = countReq.result;
        // Get all assets to calculate size
        const getAllReq = store.getAll();
        getAllReq.onerror = () => reject(getAllReq.error);
        getAllReq.onsuccess = () => {
          const assets = getAllReq.result as CachedAsset[];
          const size = assets.reduce((sum, asset) => sum + asset.blob.size, 0);
          resolve({ count, size });
        };
      };
    });
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return { count: 0, size: 0 };
  }
}
