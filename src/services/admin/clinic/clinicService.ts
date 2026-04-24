import axiosInstance from '@/config/axiosInstance';
import {ClinicModel, ClinicListResponse, ClinicResponse, ClinicPageResponse, ReferralClinic, ReferralClinician } from '@/types/clinic.types';
import { SaveResponse } from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';

const BASE = "/api/clinic";

class ClinicService {

  /**
   * GET /api/clinic/clinicbyclientbypage
   * Get paginated list of clinics by client ID
   */
  async getClinicsByPaginated(
    clientId: number,
    pageNumber: number = 1,
    pageSize: number = 50,
    search: string = ""
  ): Promise<ClinicPageResponse> {
    try {
      const response = await axiosInstance.get<ClinicPageResponse>(
        `${BASE}/clinicbyclientbypage`,
        {
          params: {
            id: clientId,
            pagenumber: pageNumber,
            pagesize: pageSize,
            search: search.trim()
          }
        }
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * GET /api/clinic/clinicbyclient/{id}
   * Get clinics assigned to a specific clinician
   */
  async getClinicByClient(clientId: number): Promise<ClinicListResponse[]> {
    try {
      const response = await axiosInstance.get<ClinicListResponse>(
        `${BASE}/clinicbyclinician/${clientId}`
      );
      return Array.isArray(response.data.data) ? response.data.data as ClinicListResponse[] : [];
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }
  /**
   * GET /api/clinic/clinicbyclinician/{id}
   * Get clinics assigned to a specific clinician
   */
  async getClinicByClinicianId(clinicianId: number): Promise<ClinicListResponse[]> {
    try {
      const response = await axiosInstance.get<ClinicListResponse>(
        `${BASE}/clinicbyclinician/${clinicianId}`
      );
      return Array.isArray(response.data.data) ? response.data.data as ClinicListResponse[] : [];
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * GET /api/clinic/{id}
   * Get a single clinic by ID
   */
  async getClinicById(id: number): Promise<ClinicModel> {
    try {
      const response = await axiosInstance.get<ClinicResponse>(
        `${BASE}/${id}`
      );
      return response.data.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * GET /api/clinic/referralclinics/{id}
   * Get referral clinics (not assigned to clinician)
   */
  async getReferralClinics(clinicianId: number): Promise<ReferralClinic[]> {
    try {
      const response = await axiosInstance.get<any>(
        `${BASE}/referralclinics/${clinicianId}`
      );
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * GET /api/clinic/referralclinician/{id}
   * Get referral clinicians for a specific clinic
   */
  async getReferralClinicians(clinicId: number): Promise<ReferralClinician[]> {
    try {
      const response = await axiosInstance.get<any>(
        `${BASE}/referralclinician/${clinicId}`
      );
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * POST /api/clinic/addclinic
   * Add new clinic or update existing clinic (id = 0 → insert, id > 0 → update)
   */
  async save(model: ClinicModel): Promise<SaveResponse> {
    try {
      const response = await axiosInstance.post<SaveResponse>(
        `${BASE}/addclinic`,
        model
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * DELETE /api/clinic/deleteclinic/{id}
   * Delete clinic by ID
   */
  async delete(id: number): Promise<SaveResponse> {
    try {
      const response = await axiosInstance.delete<SaveResponse>(
        `${BASE}/deleteclinic/${id}`
      );
      return response.data;
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }
}

export const clinicService = new ClinicService();
export default clinicService;
