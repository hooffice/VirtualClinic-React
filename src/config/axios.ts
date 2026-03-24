import axios from 'axios';
import { useAuthStore } from 'store/useAuthStore';

/**
 * Initialize axios instance with JWT interceptors
 * @deprecated Use src/config/axiosInstance.ts instead
 */
export const setupAxiosInterceptors = (): any => {
  // Request interceptor - Add JWT token to headers
  axios.interceptors.request.use(
    (config: any) => {
      const token = useAuthStore.getState().getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token expiration
  axios.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        // Token expired or unauthorized
        console.warn('Token expired or unauthorized');

        // Clear auth store
        useAuthStore.getState().clearAuth();

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      if (error.response?.status === 403) {
        console.warn('Forbidden: User does not have permission');
      }

      return Promise.reject(error);
    }
  );

  return axios;
};

/**
 * Get axios instance with JWT headers
 * @deprecated Use src/config/axiosInstance.ts instead
 */
export const getAxiosInstance = (): any => {
  const token = useAuthStore.getState().getToken();

  const instance = axios.create({
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return instance;
};

export default axios;
