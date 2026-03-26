import axiosInstance from '@/config/axiosInstance';
import { getErrorMessage } from '@/types/errors';

export interface Timezone {
  id: number;
  nameOfTimeZone: string;
  timeZoneTime: string;
  offset: string;
  utcOffset: string;
}

export interface TimezoneResponse {
  message: string;
  data: Timezone[];
  success: boolean;
}

class TimezoneService {
  /**
   * Get all available timezones
   * @returns List of timezones
   */
  async getTimezones(): Promise<Timezone[]> {
    try {
      const response: any = await axiosInstance.get('/api/common/timezone');

      if (response.data.success && response.data.data) {
        const tzData: Timezone[] = response.data.data;
        // Sort timezones by nameOfTimeZone for better UX
        return tzData.sort((a: Timezone, b: Timezone) =>
          a.nameOfTimeZone.localeCompare(b.nameOfTimeZone)
        );
      }

      throw new Error(response.data.message || 'Failed to fetch timezones');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[TimezoneService] Error fetching timezones:', errorMessage);
      throw error;
    }
  }
}

export const timezoneService = new TimezoneService();
