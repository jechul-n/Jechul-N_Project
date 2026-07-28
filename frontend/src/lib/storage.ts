export const STORAGE_KEYS = {
  savedItems: "jechul-n:saved-items",
  recentItems: "jechul-n:recent-items",
  recentSearches: "jechul-n:recent-searches",
} as const;

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredJson<T>(key: string, createFallback: () => T): T {
  const storage = getBrowserStorage();

  if (!storage) {
    return createFallback();
  }

  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return createFallback();
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return createFallback();
  }
}

export function writeStoredJson<T>(key: string, value: T): boolean {
  const storage = getBrowserStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStoredValue(key: string): boolean {
  const storage = getBrowserStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
