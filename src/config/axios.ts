import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'store/useAuthStore';

/**
 * Initialize axios instance with JWT interceptors
 */
export const setupAxiosInterceptors = (): AxiosInstance => {
  // Request interceptor - Add JWT token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
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
 */
export const getAxiosInstance = (): AxiosInstance => {
  const token = useAuthStore.getState().getToken();

  const instance = axios.create({
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return instance;
};

export default axios;
