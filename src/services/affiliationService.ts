import axiosInstance from '@/config/axiosInstance';
import { getErrorMessage } from '@/types/errors';

export interface Affiliation {
  id: number;
  affiliation: string;
}

export interface AffiliationResponse {
  message: string;
  data: Affiliation[];
  success: boolean;
}

class AffiliationService {
  /**
   * Get all affiliations
   * @returns List of affiliations
   */
  async getAffiliations(): Promise<Affiliation[]> {
    try {
      const response: any = await axiosInstance.get('/api/common/affiliationlist');

      if (response.data.success && response.data.data) {
        const affiliationData: Affiliation[] = response.data.data;
        // Sort affiliations by name for better UX
        return affiliationData.sort((a: Affiliation, b: Affiliation) =>
          a.affiliation.localeCompare(b.affiliation)
        );
      }

      throw new Error(response.data.message || 'Failed to fetch affiliations');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[AffiliationService] Error fetching affiliations:', errorMessage);
      throw error;
    }
  }
}

export const affiliationService = new AffiliationService();
