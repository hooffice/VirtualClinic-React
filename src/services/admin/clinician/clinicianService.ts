import axiosInstance from '@/config/axiosInstance';
import { ApiPageResponse, ApiResponse, SaveResponse } from '@/types/api.types';
import { axiosErrorToApiError } from '@/types/errors';
import { ClinicianModel, BillingProcedureList, BillingProcedureTypeList, ClinicianList, ChangePassword, ChangeUserName } from '@/types/admin/clinician/clinician.types';

const BASE = "/api/clinician";

class ClinicianService {
    /**
     * GET /api/clinician/clinicianbyclientorderby
     * Get paginated list of clinics by client ID
     */
    async getClinicianByPaginated(
        clientId: number,
        pageNumber: number = 1,
        pageSize: number = 50,
        search: string = ""
    ): Promise<ApiPageResponse<ClinicianList>> {
        try {
            const res = await axiosInstance.get(
                `${BASE}/clinicianbyclientorderby`,
                {
                    params: {
                        id: clientId,
                        pagenumber: pageNumber,
                        pagesize: pageSize,
                        search: search.trim()
                    }
                }
            );
            return res.data;
        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }

    /**
     * GET /api/clinicician/{id}
     */
    async getClinicianById(clinicianId: number): Promise<ClinicianModel> {
        try {
            const result = await axiosInstance.get<ApiResponse<ClinicianModel>>(
                `${BASE}/${clinicianId}`
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
     * GET /api/billingproceduretype
     */
    async getBillingProcedureType(): Promise<BillingProcedureTypeList[]> {
        try {
            const response = await axiosInstance.get<ApiResponse<BillingProcedureTypeList[]>>(
                `${BASE}/billingproceduretype`
            );

            const res = response.data;

            if (!res.success) {
                throw new Error(res.message || "Failed to fetch billing procedure types");
            }

            return res.data ?? []; // always safe

        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }
    /**
     * GET /api/invoiceproceduretype
     */
    async getInvoiceProcedureType(): Promise<BillingProcedureTypeList[]> {
        try {
            const response = await axiosInstance.get<ApiResponse<BillingProcedureTypeList[]>>(
                `${BASE}/invoiceproceduretype`
            );
            const res = response.data;

            if (!res.success) {
                throw new Error(res.message || "Failed to fetch invoice procedure types");
            }

            return res.data ?? []; // always safe

        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }
    /**
     * GET /api/clinicianbillingproceduretype
     */
    async getClinicianBillingProcedureType(): Promise<BillingProcedureList[]> {
        try {
            const response = await axiosInstance.get<ApiResponse<BillingProcedureList[]>>(
                `${BASE}/clinicianbillingproceduretype`
            );
            const res = response.data;

            if (!res.success) {
                throw new Error(res.message || "Failed to fetch billing procedure types");
            }

            return res.data ?? []; // always safe

        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }

    /**
     * POST /api/clinician/addeditclinician
     */
    async save(model: ClinicianModel): Promise<SaveResponse> {
        try {
            const response = await axiosInstance.post<SaveResponse>(
                `${BASE}/addeditclinician`,
                model
            );
            return response.data;
        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }
    /**
     * POST /api/clinician/changeusername
     */
    async changeUserName(model: ChangeUserName): Promise<SaveResponse> {
        try {
            const response = await axiosInstance.post<SaveResponse>(
                `${BASE}/changeusername`,
                model
            );
            return response.data;
        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }
    /**
     * POST /api/clinician/changepassword
     */
    async changePassword(model: ChangePassword): Promise<SaveResponse> {
        try {
            const response = await axiosInstance.post<SaveResponse>(
                `${BASE}/changepassword`,
                model
            );
            return response.data;
        } catch (error) {
            throw axiosErrorToApiError(error);
        }
    }
    /**
     * DELETE /api/clinician/{id}
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
}

export const clinicianService = new ClinicianService();
export default clinicianService;