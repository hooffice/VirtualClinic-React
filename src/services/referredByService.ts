import axiosInstance from '@/config/axiosInstance';
import { getErrorMessage } from '@/types/errors';

export interface ReferredBy {
  id: number;
  referredBy: string;
  active: boolean;
}

export interface ReferredByResponse {
  message: string;
  data: ReferredBy[];
  success: boolean;
}

class ReferredByService {
  /**
   * Get referred by list
   * @param id Clinician ID (use 0 for new registrations)
   * @returns List of referred by options
   */
  async getReferredByList(id: number = 0): Promise<ReferredBy[]> {
    try {
      const response: any = await axiosInstance.get(
        `/api/auth/getreferredbylist?id=${id}`
      );

      if (response.data.success && response.data.data) {
        const referredByData: ReferredBy[] = response.data.data;
        // Sort by name for better UX
        return referredByData.sort((a: ReferredBy, b: ReferredBy) =>
          a.referredBy.localeCompare(b.referredBy)
        );
      }

      throw new Error(response.data.message || 'Failed to fetch referred by list');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[ReferredByService] Error fetching referred by list:', errorMessage);
      throw error;
    }
  }
}

export const referredByService = new ReferredByService();
