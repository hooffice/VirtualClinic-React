import axiosInstance from '@/config/axiosInstance';
import { ApiResponse, SaveResponse } from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';
import { OrganizationListItem, OrganizationModel } from '@/types/admin/organization/organization.type';
const BASE = "/api/organization";

class OrganizationService {

  // GET /api/organization/getorganizationbyclientid?id={clientId}
  async getByClientId(clientId: number): Promise<ApiResponse<OrganizationListItem[]>> {
    try {
      const response = await axiosInstance.get(
        `${BASE}/getorganizationbyclientid`,
        { params: { id: clientId } }
      );
      return response.data;  
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  // POST /api/organization  (id = 0 → insert, id > 0 → update)
  async save(model: OrganizationModel): Promise<SaveResponse> {
    try {
      const response = await axiosInstance.post<SaveResponse>(BASE, model);
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  // DELETE /api/organization/deleteorganization/{id}
  async delete(id: number): Promise<SaveResponse> {
    try {
      const response = await axiosInstance.delete<SaveResponse>(
        `${BASE}/deleteorganization/${id}`
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

}

export const organizationService = new OrganizationService();
export default organizationService;