import { create } from 'zustand';

const STORAGE_KEY = 'novachat:username';

interface AuthState {
  username: string | null;
  setUsername: (username: string | null) => void;
  clearSession: () => void;
}

const initial = (() => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? v : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  username: initial,
  setUsername: (username) => {
    try {
      if (username) localStorage.setItem(STORAGE_KEY, username);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    set({ username });
  },
  clearSession: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ username: null });
  },
}));
