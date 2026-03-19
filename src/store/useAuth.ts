import { useAuthStore } from './useAuthStore';
import type { User } from './useAuthStore';

/**
 * Hook to use auth store with convenient methods
 */
export const useAuth = () => {
  const jwt = useAuthStore((state) => state.jwt);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setJwt = useAuthStore((state) => state.setJwt);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const getToken = useAuthStore((state) => state.getToken);
  const getUser = useAuthStore((state) => state.getUser);

  return {
    jwt,
    user,
    isAuthenticated,
    setAuth,
    setJwt,
    setUser,
    logout,
    clearAuth,
    getToken,
    getUser,
  };
};

export type { User };
