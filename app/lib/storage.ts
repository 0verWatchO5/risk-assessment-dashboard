// LocalStorage persistence layer for GRC data

import { Asset, RiskEntry, AppSettings, DEFAULT_SETTINGS } from "../types/grc";

const KEYS = {
  assets: "grc_assets",
  risks: "grc_risks",
  settings: "grc_settings",
  auth: "grc_auth",
};

type AuthState = {
  isAuthenticated: boolean;
  username: string;
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export const storage = {
  getAssets: (): Asset[] => safeGet<Asset[]>(KEYS.assets, []),
  setAssets: (assets: Asset[]) => safeSet(KEYS.assets, assets),

  getRisks: (): RiskEntry[] => safeGet<RiskEntry[]>(KEYS.risks, []),
  setRisks: (risks: RiskEntry[]) => safeSet(KEYS.risks, risks),

  getSettings: (): AppSettings => safeGet<AppSettings>(KEYS.settings, DEFAULT_SETTINGS),
  setSettings: (settings: AppSettings) => safeSet(KEYS.settings, settings),

  getAuth: (): AuthState =>
    safeGet<AuthState>(KEYS.auth, { isAuthenticated: false, username: "" }),

  isAuthenticated: (): boolean => {
    const auth = safeGet<AuthState>(KEYS.auth, { isAuthenticated: false, username: "" });
    return auth.isAuthenticated;
  },

  login: (username: string) =>
    safeSet<AuthState>(KEYS.auth, { isAuthenticated: true, username }),

  logout: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEYS.auth);
  },

  clearAll: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEYS.assets);
    localStorage.removeItem(KEYS.risks);
    localStorage.removeItem(KEYS.settings);
    localStorage.removeItem(KEYS.auth);
  },
};
