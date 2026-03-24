import axiosInstance from '@/config/axiosInstance';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Initialize application on startup
 * - Ensures axios instance with JWT interceptors is loaded
 * - Exposes auth store for debugging
 */
export const initializeApp = (): void => {
  // Axios interceptors are configured on module load
  // This just ensures the instance is initialized
  console.log('[App] Initializing with axios instance:', !!axiosInstance);

  // Expose auth store for debugging in browser console
  (window as any).authStore = useAuthStore.getState;

  console.log('[App] ✅ Initialized: Axios + Zustand store ready');
  console.log('[App] 💾 Access auth store in console: authStore()');
};
