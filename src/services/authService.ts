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
import { clearDeviceId } from '@/helpers/deviceHelper';

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
  MFA_SETUP: '/api/mfa/setup',
  MFA_ENABLE: '/api/mfa/enable',
};

class AuthService {
  private axiosInstance = axiosInstance;

  /**
   * Normalize API response to handle different property casing
   * Maps numeric status codes to string equivalents
   *
   * Backend AuthStatus enum:
   * - 0 = Failed
   * - 1 = RequiresMfa
   * - 2 = Authenticated
   * - 3 = TwoFARequired
   */
  private normalizeResponse(response: any): any {
    if (!response) return response;

    // Map numeric status codes to string equivalents
    let normalizedStatus = response.Status || response.status;
    if (typeof normalizedStatus === 'number') {
      switch (normalizedStatus) {
        case 0:
          normalizedStatus = 'Failed';
          break;
        case 1:
          normalizedStatus = 'RequiresMfa';
          break;
        case 2:
          normalizedStatus = 'Authenticated';
          break;
        case 3:
          normalizedStatus = 'TwoFARequired';
          break;
        default:
          normalizedStatus = 'Unknown';
      }
    }

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
      profileInfo: response.ProfileInfo || response.profileInfo,
      ProfileInfo: response.ProfileInfo || response.profileInfo,      
      status: normalizedStatus,
      Status: normalizedStatus,
      userId: response.UserId || response.userId,
      UserId: response.UserId || response.userId,
    };
  }

  /**
   * OAuth 2 Login Flow - Step 1 ONLY:
   * POST /api/oauth/login with email/password → get authorization code OR MFA requirement
   *
   * NOTE: This method only calls /api/oauth/login
   * Code exchange happens in OAuthCallback component via exchangeCodeForToken()
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('[AuthService] login() called', { email: credentials.email });

      // Step 1: Get authorization code OR MFA requirement
      const loginResponse = await this.axiosInstance.post(
        ENDPOINTS.LOGIN,
        credentials
      );

      const normalizedResponse = this.normalizeResponse(loginResponse.data);

      console.log('[AuthService] OAuth login response received:', {
        status: normalizedResponse?.Status || normalizedResponse?.status,
        hasCode: !!(normalizedResponse?.Code || normalizedResponse?.code),
        twoFactorEnabled: normalizedResponse?.TwoFactorEnabled || normalizedResponse?.twoFactorEnabled,
      });

      // Return the raw response - let the thunk/callback page handle routing
      // Response can be:
      // 1. { Code, State, Success: true } → Redirect to OAuthCallback
      // 2. { Status: "RequiresMfa", UserId, Success: true } → Redirect to MFAVerification
      // 3. { Status: "Require2FaSetup", UserId, Success: true } → Redirect to MFASetup
      return normalizedResponse;
    } catch (error) {
      console.error('[AuthService] login() error:', error);
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Exchange authorization code for JWT token (OAuth 2 callback)
   * This is called from OAuthCallback component
   */
  async exchangeCodeForToken(request: {
    code: string;
    state: string;
    provider: string;
    trustedDevice: boolean;
  }): Promise<AuthResponse> {
    try {
      console.log('[AuthService] exchangeCodeForToken() called with:', {
        provider: request.provider,
        trustedDevice: request.trustedDevice,
        codeLength: request.code?.length,
        stateLength: request.state?.length,
      });

      console.log('[AuthService] Sending to backend:', {
        code: request.code?.substring(0, 20) + '...',
        state: request.state?.substring(0, 20) + '...',
        provider: request.provider,
        trustedDevice: request.trustedDevice,  // ✅ This will be sent
      });

      const response = await this.axiosInstance.post(
        ENDPOINTS.OAUTH_CALLBACK,
        request
      );

      const normalizedResponse = this.normalizeResponse(response.data);

      console.log('[AuthService] Raw backend response:', {
        rawData: JSON.stringify(response.data, null, 2),
      });

      console.log('[AuthService] Token exchange response:', {
        status: normalizedResponse?.Status || normalizedResponse?.status,
        hasAccessToken: !!(normalizedResponse?.AccessToken || normalizedResponse?.accessToken),
        hasUser: !!(normalizedResponse?.User || normalizedResponse?.user),
        normalizedResponse: JSON.stringify(normalizedResponse, null, 2),
      });

      // Store tokens in Zustand if present
      if (normalizedResponse?.accessToken || normalizedResponse?.AccessToken) {
        const authStore = useAuthStore.getState();
        const accessToken = normalizedResponse.accessToken || normalizedResponse.AccessToken;
        const refreshToken = normalizedResponse.refreshToken || normalizedResponse.RefreshToken || '';

        authStore.setTokens(accessToken, refreshToken);

        console.log('[AuthService] ✅ Tokens stored in Zustand:', {
          accessTokenLength: accessToken.length,
          refreshTokenLength: refreshToken.length,
        });
      }

      // Store user in localStorage if present
      const userToStore = normalizedResponse?.user || normalizedResponse?.User;
      const userProfile = normalizedResponse?.profileInfo || normalizedResponse?.ProfileInfo;
      if (userToStore) {
        console.log('[AuthService] Storing user in localStorage');
        localStorage.setItem('authUser', JSON.stringify(userToStore));

        // Only store userProfile if it exists
        if (userProfile) {
          console.log('[AuthService] Storing userProfile in localStorage');
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
      }

      return normalizedResponse;
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
      localStorage.removeItem('userProfile');
      clearDeviceId();
      console.log('[AuthService] ✅ Local state cleared, user logged out');
    } catch (error) {
      console.error('[AuthService] Unexpected logout error:', error);
      // Still ensure local state is cleared
      const authStore = useAuthStore.getState();
      authStore.logout();
      localStorage.removeItem('authUser');
      localStorage.removeItem('userProfile');
      clearDeviceId();
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
   * Verify MFA code during login
   * Returns authorization code (not JWT) for OAuth callback
   */
  async verifyMfa(request: MfaVerifyRequest): Promise<MfaVerifyResponse> {
    try {
      console.log('[AuthService] verifyMfa() called with request:', {
        userId: request.userId,
        tokenLength: request.token?.length,
        method: request.method,
        TrustDevice: request.TrustDevice,
        TrustDays: request.TrustDays,
      });

      const response = await this.axiosInstance.post(ENDPOINTS.MFA_VERIFY, request);

      const normalizedResponse = this.normalizeResponse(response.data);

      console.log('[AuthService] MFA verification successful', {
        hasCode: !!normalizedResponse?.code || !!normalizedResponse?.Code,
        status: normalizedResponse?.status,
      });

      // Note: MFA verify returns authorization code, NOT JWT
      // Frontend must exchange code via /api/oauth/callback
      // Tokens will be stored after callback exchange

      return normalizedResponse;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Setup MFA for user (legacy 2FA to modern MFA)
   * Generates QR code and secret key
   */
  async setupMfa(userId: string): Promise<any> {
    try {
      console.log('[AuthService] setupMfa() for userId:', userId);
      const response = await this.axiosInstance.post(ENDPOINTS.MFA_SETUP, {
        userId,
        method: 'totp',
      });

      console.log('[AuthService] MFA setup generated');
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Enable MFA after verification
   * User scans QR and verifies code
   */
  async enableMfa(userId: string, token: string): Promise<void> {
    try {
      console.log('[AuthService] enableMfa() for userId:', userId);
      await this.axiosInstance.post(ENDPOINTS.MFA_ENABLE, {
        userId,
        token,
      });

      console.log('[AuthService] ✅ MFA enabled successfully');
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
