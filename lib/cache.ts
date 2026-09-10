// Best-effort localStorage cache so repeat visits paint from the last session
// instead of waiting on the network. Every access is guarded: private mode,
// cleared site data and quota limits must never break the app.

const PREFIX = "biblio_cache_";

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — the network path still works.
  }
}
