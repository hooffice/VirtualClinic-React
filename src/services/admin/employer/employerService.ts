import axiosInstance from '@/config/axiosInstance';
import { SaveResponse } from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';
import { EmployerListResponse, EmployerModel } from '@/types/admin/employer/employer.type';

const BASE = "/api/employer";

class EmployerService {
   /**
   * GET /api/employer/getemployerlistbyorgrnizationid
   */
  async getEmployerByOrganization(organizationId: number): Promise<EmployerListResponse> {
    try {
      const response = await axiosInstance.get<EmployerListResponse>(
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
   * GET /api/employer/getemployerlistbyorgrnizationid
   */
  async getEmployerByClient(clientId: number): Promise<EmployerListResponse> {
    try {
      const response = await axiosInstance.get<EmployerListResponse>(
        `${BASE}/getemployerlist`,
        {
          params: {id: clientId}
        }
      );
      return response.data.data;
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