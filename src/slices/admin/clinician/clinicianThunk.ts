
import { clinicianService as service } from "@/services/admin/clinician/clinicianService";
import { ClinicianModel } from "@/types/admin/clinician/clinician.types";

import {
  setLoading,
  setSaving,
  setListWithPagination,
  setSuccess,
  setError,
  setSelected,
  deleteSuccess,
} from "./clinicianSlice";
import { handleAsync } from "@/utils/asyncHandler";

/**
 * Fetch clinicians by client with pagination
 */
export const fetchCliniciansList = (
    params: {
      clientId: number;
      pageNumber?: number;
      pageSize?: number;
      search?: string;
    }
  ) => async (dispatch: any) => {
    await handleAsync(
      dispatch,
      () => service.getClinicianByPaginated(
        params.clientId,
        params.pageNumber || 1,
        params.pageSize || 10,
        params.search || ""        
      ),
      {
        setLoading,
        setError,
      },
      (response, dispatch) => {

        const payload = {
           data: response.data,
           currentPage: params.pageNumber || 1,  // Use requested page, not response
           totalPages: response.xpage.totalPages,
           pageSize: response.xpage.pageSize,
           totalRecords: response.xpage.totalRecords,
      };

        dispatch(setListWithPagination(payload));
      }
    );
  }

/**
 * Fetch clinician by clinician ID
 */
export const fetchClinicianByClinicianId = (clinicianId: number)  => 
  async (dispatch: any) => {
    await handleAsync(
      dispatch,
      () => service.getClinicianById(clinicianId),
      {
        setLoading,
        setError,
      },
      (res, dispatch) => {
        dispatch(setSelected(res));
      }
    );
  };

/**
 * Save Clinician (id = 0 → insert, id > 0 → update)
 */
export const saveClinician = (model: ClinicianModel) =>
  async (dispatch: any) => {
    return await handleAsync(
      dispatch,
      () => service.save(model),
      {
        setSaving,
        setError,
      },
      async (res, dispatch) => {
        if (!res.success) {
          throw new Error(res.message);
        }
        await dispatch(setSuccess(res.message || "Saved successfully"));
        return res;
        // const param = {
        //   clientId: clientId,
        //   pageNumber: 1,
        //   pageSize: 10,
        //   search: ""
        // }
        //await dispatch(fetchCliniciansList(param));
      }
    );
  };

  /**
   * Delete Clinician by ID
   */
export const removeClinician = (id: number) => async (dispatch: any) => {
  await handleAsync(
    dispatch,
    () => service.delete(id),
    {
      setSaving,
      setError
    },
    async (res, dispatch) => {
      if (!res.success) {
        throw new Error(res.message);
      }

      dispatch(deleteSuccess(id));
    }
  );
};

