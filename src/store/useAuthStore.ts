import { create } from 'zustand';

export interface User {
  id?: string;
  username?: string;
  email?: string;
  displayName?: string;
  uid?: string;
  [key: string]: any;
}

export interface AuthState {
  // State
  jwt: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (jwt: string, user: User) => void;
  setJwt: (jwt: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  clearAuth: () => void;
  getToken: () => string | null;
  getUser: () => User | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  jwt: null,
  user: null,
  isAuthenticated: false,

  // Actions
  setAuth: (jwt: string, user: User) => {
    set({
      jwt,
      user,
      isAuthenticated: true,
    });
  },

  setJwt: (jwt: string) => {
    set({ jwt });
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: () => {
    set({
      jwt: null,
      user: null,
      isAuthenticated: false,
    });
  },

  clearAuth: () => {
    set({
      jwt: null,
      user: null,
      isAuthenticated: false,
    });
  },

  getToken: () => get().jwt,

  getUser: () => get().user,
}));
