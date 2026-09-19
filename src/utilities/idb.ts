const DB_NAME = "eteeap-app-drafts";
const STORE = "drafts";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getObject<T>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function setObject(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeObject(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function memoryFallback(key: string) {
  return (window as unknown as Record<string, unknown>)[`__idb_${key}__`];
}

function setMemoryFallback(key: string, value: unknown) {
  (window as unknown as Record<string, unknown>)[`__idb_${key}__`] = value;
}

function tryScriptStorage(key: string, value: unknown): boolean {
  const json = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, json);
    return true;
  } catch {
    try {
      window.sessionStorage.setItem(key, json);
      return true;
    } catch {
      return false;
    }
  }
}

function tryScriptRead(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall through to memory */
  }
  return memoryFallback(key);
}

export async function setObjectWithFallback(key: string, value: unknown): Promise<void> {
  try {
    await setObject(key, value);
  } catch {
    if (!tryScriptStorage(key, value)) {
      setMemoryFallback(key, value);
    }
  }
}

export async function getObjectWithFallback<T>(key: string): Promise<T | null> {
  try {
    const value = await getObject<T>(key);
    if (value !== null && value !== undefined) return value;
  } catch {
    /* fall through */
  }
  return (tryScriptRead(key) as T | null) ?? null;
}