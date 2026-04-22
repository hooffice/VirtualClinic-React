import axiosInstance from '@/config/axiosInstance';
import { SaveResponse } from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';

const BASE = "/api/organization";

export interface OrganizationListItem {
  id:            number;
  client_ID:     number;
  code:          string | null;
  name:          string | null;
  address_Line1: string | null;
  address_Line2: string | null;
  city_ID:       number | null;
  state_ID:      number | null;
  country_ID:    number | null;
  zip:           string | null;
  contact1:      string | null;
  contact2:      string | null;
  active:        string | null;
  company_Name:  string | null;
  state:         string | null;
  city:          string | null;
  country:       string | null;
}

export interface OrganizationModel {
  id:           number;
  clientId:     number;
  code:         string | null;
  name:         string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  cityId:       number | null;
  stateId:      number | null;
  countryId:    number | null;
  zip:          string | null;
  contact1:     string | null;
  contact2:     string | null;
  active:       boolean | null;
}

interface ListResponse {
  data:    OrganizationListItem[];
  success: boolean;
}


class OrganizationService {

  // GET /api/organization/getorganizationbyclientid?id={clientId}
  async getByClientId(clientId: number): Promise<OrganizationListItem[]> {
    try {
      const response = await axiosInstance.get<ListResponse>(
        `${BASE}/getorganizationbyclientid`,
        { params: { id: clientId } }
      );
      return response.data.data;  
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