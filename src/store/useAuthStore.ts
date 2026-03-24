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
  // Authentication State
  jwt: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // MFA State
  mfaRequired: boolean;
  mfaUserId: string | null;

  // Actions
  setAuth: (jwt: string, user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setJwt: (jwt: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setUser: (user: User) => void;
  setMfaRequired: (userId: string) => void;
  clearMfaRequired: () => void;
  logout: () => void;
  clearAuth: () => void;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  getUser: () => User | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  jwt: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  mfaRequired: false,
  mfaUserId: null,

  // Authentication Actions
  setAuth: (jwt: string, user: User) => {
    set({
      jwt,
      user,
      isAuthenticated: true,
      mfaRequired: false,
      mfaUserId: null,
    });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    set({
      jwt: accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  setJwt: (jwt: string) => {
    set({ jwt, isAuthenticated: !!jwt });
  },

  setRefreshToken: (refreshToken: string) => {
    set({ refreshToken });
  },

  setUser: (user: User) => {
    set({ user });
  },

  // MFA Actions
  setMfaRequired: (userId: string) => {
    set({
      mfaRequired: true,
      mfaUserId: userId,
      isAuthenticated: false,
    });
  },

  clearMfaRequired: () => {
    set({
      mfaRequired: false,
      mfaUserId: null,
    });
  },

  logout: () => {
    set({
      jwt: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      mfaRequired: false,
      mfaUserId: null,
    });
  },

  clearAuth: () => {
    set({
      jwt: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      mfaRequired: false,
      mfaUserId: null,
    });
  },

  getToken: () => get().jwt,

  getRefreshToken: () => get().refreshToken,

  getUser: () => get().user,
}));
