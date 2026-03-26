import axiosInstance from '@/config/axiosInstance';
import { getErrorMessage } from '@/types/errors';

export interface EmailCheckResponse {
  message: string;
  success: boolean;
  exists: boolean;
}

class EmailService {
  /**
   * Check if email already exists in the system
   * @param email Email address to check
   * @returns true if email exists, false if available
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      if (!email || email.trim().length === 0) {
        return false;
      }

      const response: any = await axiosInstance.get(
        `/api/auth/check-email?email=${encodeURIComponent(email.trim())}`
      );

      if (response.data.success) {
        return response.data.exists;
      }

      return false;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[EmailService] Error checking email:', errorMessage);
      // If API fails, return false to allow user to proceed
      return false;
    }
  }
}

export const emailService = new EmailService();
