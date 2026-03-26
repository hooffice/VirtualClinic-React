/**
 * Registration Service
 * Handles user registration, email verification, and related operations
 */

import axiosInstance from '@/config/axiosInstance';
import {
  RegistrationRequest,
  RegistrationResponse,
} from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';

const ENDPOINTS = {
  REGISTER: '/api/auth/register',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification-email',
};

class RegistrationService {
  private axiosInstance = axiosInstance;

  /**
   * Register a new user (Patient or Clinician)
   */
  async register(data: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      console.log('[RegistrationService] register() called', {
        email: data.email,
        userType: data.userType,
      });

      const response = await this.axiosInstance.post(
        ENDPOINTS.REGISTER,
        data
      );

      console.log('[RegistrationService] Registration successful:', {
        message: response.data?.message,
        userId: response.data?.userId,
      });

      return response.data;
    } catch (error) {
      console.error('[RegistrationService] Registration failed:', error);
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Verify email with confirmation token
   */
  async verifyEmail(
    token: string,
    email: string
  ): Promise<{ message: string; success: boolean }> {
    try {
      console.log('[RegistrationService] verifyEmail() called');

      const response = await this.axiosInstance.get(
        ENDPOINTS.VERIFY_EMAIL,
        {
          params: { token, email },
        }
      );

      console.log('[RegistrationService] Email verified successfully');
      return response.data;
    } catch (error) {
      console.error('[RegistrationService] Email verification failed:', error);
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    email: string
  ): Promise<{ message: string; success: boolean }> {
    try {
      console.log('[RegistrationService] resendVerificationEmail() called', {
        email,
      });

      const response = await this.axiosInstance.post(
        ENDPOINTS.RESEND_VERIFICATION,
        { email }
      );

      console.log('[RegistrationService] Verification email resent');
      return response.data;
    } catch (error) {
      console.error('[RegistrationService] Resend verification failed:', error);
      throw axiosErrorToApiError(error);
    }
  }
}

/**
 * Export singleton instance
 */
export const registrationService = new RegistrationService();
export default registrationService;
