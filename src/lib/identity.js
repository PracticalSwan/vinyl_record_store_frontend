export const ANONYMOUS_ID_KEY = 'groovehaus.anonymous-id.v1';
export const SESSION_ID_KEY = 'groovehaus.session-id.v1';
export const TRACKING_PREFERENCE_KEY = 'groovehaus.usage-data.v1';
let runtimeTrackingPreference = null;

function randomId(prefix) {
  const value = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${value}`;
}

function readOrCreate(storage, key, prefix) {
  try {
    let value = storage?.getItem(key);
    if (!value) {
      value = randomId(prefix);
      storage?.setItem(key, value);
    }
    return value || randomId(prefix);
  } catch {
    return randomId(prefix);
  }
}

export function getAnonymousId(storage = globalThis.localStorage) {
  return readOrCreate(storage, ANONYMOUS_ID_KEY, 'anon');
}

export function getSessionId(storage = globalThis.sessionStorage) {
  return readOrCreate(storage, SESSION_ID_KEY, 'session');
}

export function isTrackingEnabled(storage = globalThis.localStorage) {
  if (runtimeTrackingPreference !== null) return runtimeTrackingPreference;
  try {
    return storage?.getItem(TRACKING_PREFERENCE_KEY) !== 'disabled';
  } catch {
    return true;
  }
}

export function storeTrackingPreference(enabled, storage = globalThis.localStorage) {
  runtimeTrackingPreference = Boolean(enabled);
  try {
    storage?.setItem(TRACKING_PREFERENCE_KEY, enabled ? 'enabled' : 'disabled');
  } catch {
    // The runtime override remains authoritative for this page.
  }
}

export function resetTrackingPreferenceForTests() {
  runtimeTrackingPreference = null;
}
