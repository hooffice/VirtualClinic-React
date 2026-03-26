import axiosInstance from '@/config/axiosInstance';
import { getErrorMessage } from '@/types/errors';

export interface SalesRep {
  id: number;
  salesRep: string;
  active: boolean;
}

export interface SalesRepResponse {
  message: string;
  data: SalesRep[];
  success: boolean;
}

class SalesRepService {
  /**
   * Get sales rep list
   * @returns List of sales representatives
   */
  async getSalesRepList(): Promise<SalesRep[]> {
    try {
      const response: any = await axiosInstance.get('/api/auth/getsalesreplist');

      if (response.data.success && response.data.data) {
        const salesRepData: SalesRep[] = response.data.data;
        // Sort by name for better UX
        return salesRepData.sort((a: SalesRep, b: SalesRep) =>
          a.salesRep.localeCompare(b.salesRep)
        );
      }

      throw new Error(response.data.message || 'Failed to fetch sales rep list');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[SalesRepService] Error fetching sales rep list:', errorMessage);
      throw error;
    }
  }
}

export const salesRepService = new SalesRepService();
