/**
 * Authentication Service
 * Handles OAuth 2 Authorization Code Flow with JWT
 */

import axiosInstance from '@/config/axiosInstance';
import {
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserTimezoneModel,
  UserDto,
  MfaVerifyRequest,
  MfaVerifyResponse,
} from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * OAuth 2 Authorization Code Flow Endpoints
 */
const ENDPOINTS = {
  LOGIN: '/api/oauth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  CHANGE_TIMEZONE: '/api/auth/change-timezone',
  CONFIRM_EMAIL: '/api/auth/confirm-email',
  OAUTH_CALLBACK: '/api/oauth/callback',
  MFA_VERIFY: '/api/mfa/verify',
};

class AuthService {
  private axiosInstance = axiosInstance;

  /**
   * Normalize API response to handle different property casing
   */
  private normalizeResponse(response: any): any {
    if (!response) return response;
    return {
      ...response,
      code: response.Code || response.code,
      Code: response.Code || response.code,
      state: response.State || response.state,
      State: response.State || response.state,
      accessToken: response.AccessToken || response.accessToken,
      AccessToken: response.AccessToken || response.accessToken,
      refreshToken: response.RefreshToken || response.refreshToken,
      RefreshToken: response.RefreshToken || response.refreshToken,
      user: response.User || response.user,
      User: response.User || response.user,
      status: response.Status || response.status,
      Status: response.Status || response.status,
      userId: response.UserId || response.userId,
      UserId: response.UserId || response.userId,
    };
  }

  /**
   * OAuth 2 Login Flow:
   * Step 1: POST /api/oauth/login with email/password → get authorization code
   * Step 2: POST /api/oauth/callback with code → exchange for JWT
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('[AuthService] login() called', { email: credentials.email });

      // Step 1: Get authorization code
      const loginResponse = await this.axiosInstance.post(
        ENDPOINTS.LOGIN,
        credentials
      );

      const normalizedLoginResponse = this.normalizeResponse(loginResponse.data);
      console.log('[AuthService] OAuth login response received');

      // Check if MFA is required
      if (
        normalizedLoginResponse?.Status === 'RequiresMfa' ||
        normalizedLoginResponse?.status === 'RequiresMfa'
      ) {
        console.log('[AuthService] MFA required');
        return normalizedLoginResponse;
      }

      // Step 2: Exchange code for JWT
      const authCode = normalizedLoginResponse?.Code || normalizedLoginResponse?.code;
      if (authCode) {
        console.log('[AuthService] Exchanging authorization code for token');
        const callbackResponse = await this.exchangeCodeForToken({
          code: authCode,
          state: normalizedLoginResponse?.State || normalizedLoginResponse?.state,
          provider: 'webapi',
        });

        const normalizedCallbackResponse = this.normalizeResponse(callbackResponse);

        // Store tokens in Zustand
        if (normalizedCallbackResponse?.accessToken) {
          const authStore = useAuthStore.getState();
          authStore.setTokens(
            normalizedCallbackResponse.accessToken,
            normalizedCallbackResponse.refreshToken || ''
          );
          console.log('[AuthService] ✅ Tokens stored in Zustand:', {
            accessTokenLength: normalizedCallbackResponse.accessToken.length,
            refreshTokenLength: normalizedCallbackResponse.refreshToken?.length || 0,
          });

          // Verify tokens are actually in store
          const verify = useAuthStore.getState();
          console.log('[AuthService] ✓ Verification - tokens in store:', {
            hasJwt: !!verify.jwt,
            hasRefreshToken: !!verify.refreshToken,
          });
        }

        // Store user in localStorage
        const userToStore =
          normalizedCallbackResponse?.user ||
          callbackResponse?.User ||
          callbackResponse?.user;
        if (userToStore) {
          console.log('[AuthService] Storing user in localStorage');
          localStorage.setItem('authUser', JSON.stringify(userToStore));
        }

        return normalizedCallbackResponse;
      }

      return normalizedLoginResponse;
    } catch (error) {
      console.error('[AuthService] login() error:', error);
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Exchange authorization code for JWT token (OAuth 2 callback)
   */
  async exchangeCodeForToken(request: {
    code: string;
    state: string;
    provider: string;
  }): Promise<AuthResponse> {
    try {
      console.log('[AuthService] exchangeCodeForToken()');
      const response = await this.axiosInstance.post(
        ENDPOINTS.OAUTH_CALLBACK,
        request
      );
      return response.data;
    } catch (error) {
      console.error('[AuthService] Token exchange failed:', error);
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegistrationRequest): Promise<AuthResponse> {
    try {
      console.log('[AuthService] register()');
      const response = await this.axiosInstance.post(ENDPOINTS.REGISTER, data);
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserDto> {
    try {
      console.log('[AuthService] getProfile()');
      const response = await this.axiosInstance.get(ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Logout user
   * - Calls backend logout endpoint (continues even if fails)
   * - Always clears local state
   * - Note: 401 errors during logout are expected (token may be expired)
   */
  async logout(): Promise<void> {
    try {
      const authStore = useAuthStore.getState();
      const token = authStore.jwt;

      console.log('[AuthService] Logging out user', { hasToken: !!token });

      // Try to call backend logout (but don't fail if it does)
      try {
        await this.axiosInstance.post(ENDPOINTS.LOGOUT);
        console.log('[AuthService] Backend logout successful');
      } catch (error: any) {
        const status = error?.response?.status;
        // 401 is expected if token expired - don't log as warning
        if (status === 401) {
          console.log('[AuthService] Backend returned 401 (expected - token may be expired)');
        } else if (status) {
          console.warn('[AuthService] Backend logout failed:', status);
        }
        // Continue with local logout even if API fails
      }

      // Always clear local state
      authStore.logout();
      localStorage.removeItem('authUser');
      console.log('[AuthService] ✅ Local state cleared, user logged out');
    } catch (error) {
      console.error('[AuthService] Unexpected logout error:', error);
      // Still ensure local state is cleared
      const authStore = useAuthStore.getState();
      authStore.logout();
      localStorage.removeItem('authUser');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      console.log('[AuthService] refreshToken()');
      const response = await this.axiosInstance.post(ENDPOINTS.REFRESH_TOKEN, {
        refreshToken,
      });

      // Update tokens in store
      if (response.data?.accessToken) {
        const authStore = useAuthStore.getState();
        authStore.setTokens(
          response.data.accessToken,
          response.data.refreshToken || refreshToken
        );
        console.log('[AuthService] Tokens updated after refresh');
      }

      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Request password reset link
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      console.log('[AuthService] forgotPassword()');
      const response = await this.axiosInstance.post(
        ENDPOINTS.FORGOT_PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      console.log('[AuthService] resetPassword()');
      const response = await this.axiosInstance.post(
        ENDPOINTS.RESET_PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Confirm email address
   */
  async confirmEmail(token: string, email: string): Promise<{ message: string }> {
    try {
      console.log('[AuthService] confirmEmail()');
      const response = await this.axiosInstance.get(ENDPOINTS.CONFIRM_EMAIL, {
        params: { token, email },
      });
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Change user timezone
   */
  async changeTimezone(data: UserTimezoneModel): Promise<{ message: string }> {
    try {
      console.log('[AuthService] changeTimezone()');
      const response = await this.axiosInstance.post(
        ENDPOINTS.CHANGE_TIMEZONE,
        data
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMfa(request: MfaVerifyRequest): Promise<MfaVerifyResponse> {
    try {
      console.log('[AuthService] verifyMfa()');
      const response = await this.axiosInstance.post(ENDPOINTS.MFA_VERIFY, request);

      const normalizedResponse = this.normalizeResponse(response.data);

      // Store tokens if present
      if (normalizedResponse?.accessToken) {
        const authStore = useAuthStore.getState();
        authStore.setTokens(
          normalizedResponse.accessToken,
          normalizedResponse.refreshToken || ''
        );
        console.log('[AuthService] Tokens stored after MFA verification');
      }

      // Store user if present
      const userToStore =
        normalizedResponse?.user ||
        response.data?.User ||
        response.data?.user;
      if (userToStore) {
        localStorage.setItem('authUser', JSON.stringify(userToStore));
      }

      return normalizedResponse;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }
}

/**
 * Export singleton instance
 */
export const authService = new AuthService();
export default authService;
