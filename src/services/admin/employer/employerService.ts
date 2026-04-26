import axiosInstance from '@/config/axiosInstance';
import { ApiResponse, SaveResponse } from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';
import { EmployerList, EmployerModel } from '@/types/admin/employer/employer.type';

const BASE = "/api/employer";

class EmployerService {
   /**
   * GET /api/employer/getemployerlistbyorgrnizationid
   */
  async getEmployerByOrganization(organizationId: number): Promise<ApiResponse<EmployerList>[]> {
    try {
      const response = await axiosInstance.get(
        `${BASE}/getemployerlistbyorgrnizationid`,
        {
          params: {id: organizationId}
        }
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

   /**
   * GET /api/employer/getemployerlist
   */
  async getEmployerByClient(clientId: number): Promise<ApiResponse<EmployerList[]>> {
    try {
      const response = await axiosInstance.get(
        `${BASE}/getemployerlist`,
        {
          params: {id: clientId}
        }
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * POST /api/employer
   * Add new employer or update existing employer (id = 0 → insert, id > 0 → update)
   */
  async save(model: EmployerModel): Promise<SaveResponse> {
    try {
      const response = await axiosInstance.post<SaveResponse>(
        `${BASE}`,
        model
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * DELETE /api/employer/deleteemployer/{id}
   * Delete employer by ID
   */
  async delete(id: number): Promise<SaveResponse> {
    try {
      const response = await axiosInstance.delete<SaveResponse>(
        `${BASE}/deleteemployer/${id}`
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }
}

export const employerService = new EmployerService();
export default employerService;