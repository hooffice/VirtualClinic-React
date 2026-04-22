/**
 * Axios Instance Configuration
 * - JWT Token Injection
 * - Automatic Token Refresh
 * - Error Handling
 * - Request/Response Interceptors
 */

import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiError, axiosErrorToApiError } from '@/types/errors';

// @ts-ignore - Vite env type issue
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:7202';

console.log('[AxiosInstance] Initializing with baseURL:', API_BASE_URL);

/**
 * Create Axios Instance
 */
const instance: any = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Token refresh queue to prevent multiple simultaneous refreshes
 */
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailed: (error: any) => void;
}> = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor - Inject JWT Token
 */
instance.interceptors.request.use(
  (config: any) => {
    const token = useAuthStore.getState().jwt;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => {
    console.error('[AxiosInstance] Request error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle Token Refresh & Errors
 */
instance.interceptors.response.use(
  (response: any) => {
    console.log('[AxiosInstance] Response success:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config as any;

    console.error('[AxiosInstance] Response error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      message: error.message,
    });

    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((onSuccess, onFailed) => {
          failedQueue.push({ onSuccess, onFailed });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // No body needed — ASP.NET reads refreshToken from HttpOnly cookie automatically
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          null,
          {
            timeout: 10000,
            withCredentials: true,
          }
        );

        const accessToken = response.data?.AccessToken || response.data?.accessToken;

        // Store only access token — refresh token stays in HttpOnly cookie
        useAuthStore.getState().setJwt(accessToken);

        // Update default headers
        instance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh token cookie expired or invalid — force re-login
        useAuthStore.getState().logout();
        localStorage.removeItem('authUser');
        localStorage.removeItem('userProfile');
        processQueue(refreshError, null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 - Forbidden (no refresh, just logout)
    if (error.response?.status === 403) {
      console.warn('[AxiosInstance] 403 Forbidden - logging out');
      const authStore = useAuthStore.getState();
      authStore.logout();
    }

    // Convert to ApiError
    const apiError = axiosErrorToApiError(error);
    return Promise.reject(apiError);
  }
);

/**
 * Export singleton instance
 */
export const getany = (): any => {
  return instance;
};

export default instance;
