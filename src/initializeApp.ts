import { setupAxiosInterceptors } from 'config/axios';
//import { useAuthStore } from 'store/useAuthStore';

/**
 * Initialize application on startup
 * Sets up axios interceptors for JWT handling
 */
export const initializeApp = (): void => {
  // Setup axios interceptors for JWT authentication
  setupAxiosInterceptors();

  // // Expose auth store for debugging in browser console
  // (window as any).authStore = useAuthStore.getState;

  // console.log('✅ App initialized: Axios interceptors configured');
  // console.log('💾 Access auth store in console: authStore()');
};
