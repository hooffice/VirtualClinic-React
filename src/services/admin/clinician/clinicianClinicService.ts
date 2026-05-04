import axiosInstance from '@/config/axiosInstance';
import { ApiResponse, SaveResponse } from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';
import { ClinicListItem } from '@/types/admin/clinic/clinic.types';
import { ClinicianClinicModel } from '@/types/admin/clinician/referalclinic.types';

const BASE = "/api/clinicianclinic";

class ClinicianClinicService {
    /**
     * GET /api/clinicianclinic/referralclinics/{id}
     */
    async getReferalClinicbyClinicianById(clinicianId: number): Promise<ClinicListItem[]> {
        try {
            const result = await axiosInstance.get<ApiResponse<ClinicListItem[]>>(
                `${BASE}/referralclinics/${clinicianId}`
            );
            const res = result.data;
            if (!res.success) {
                throw new Error(res.message || "Failed to fetch data");
            }

            return res.data ?? {};
        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }

    /**
     * POST /api/clinicianclinic/addeditreferralclinics
     */
    async save(model: ClinicianClinicModel): Promise<SaveResponse> {
        try {
            const response = await axiosInstance.post<SaveResponse>(
                `${BASE}/addeditreferralclinics`,
                model
            );
            return response.data;
        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }


    /**
     * DELETE /api/clinicianclinic/{id}
     */
    async delete(id: number): Promise<SaveResponse> {
        try {
            const response = await axiosInstance.delete<SaveResponse>(
                `${BASE}/${id}`
            );
            return response.data;
        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }    
};

export const clinicianClinicService = new ClinicianClinicService();
export default clinicianClinicService;