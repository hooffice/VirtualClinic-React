import { createAsyncThunk } from "@reduxjs/toolkit";
import { clinicService } from "@/services/admin/clinic/clinicService";
import { ClinicModel } from "@/types/clinic/clinic.types";
import {
  setLoading,
  setSaving,
  setList,
  setSuccess,
  setError,
  setPagination,
} from "./clinicSlice";

/**
 * Fetch clinics by client with pagination
 */
export const fetchClinics = createAsyncThunk(
  "clinic/fetchClinics",
  async (
    params: {
      clientId: number;
      pageNumber?: number;
      pageSize?: number;
      search?: string;
    },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await clinicService.getClinicsByPaginated(
        params.clientId,
        params.pageNumber || 1,
        params.pageSize || 50,
        params.search || ""
      );

      dispatch(setList(response.data));

      console.log("📌 API Response xpage:", response.xpage);
      // Use requested pageNumber since API doesn't return it
      const currentPage = params.pageNumber || 1;
      console.log("✓ Setting Redux currentPage to:", currentPage);

      dispatch(
        setPagination({
          currentPage: currentPage,
          totalPages: response.xpage.totalPages,
          pageSize: response.xpage.pageSize,
          totalRecords: response.xpage.totalRecords,
        })
      );

      return response.data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch clinics"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Fetch clinics by client ID (without pagination)
 */
export const fetchClinicsByClient = createAsyncThunk(
  "clinic/fetchClinicsByClient",
  async (clientId: number, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const result = await clinicService.getClinicByClient(clientId);
      dispatch(setList(result as any));
      return result;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch clinics"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Fetch clinics by clinician ID
 */
export const fetchClinicsByClinicianId = createAsyncThunk(
  "clinic/fetchClinicsByClinicianId",
  async (clinicianId: number, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const result = await clinicService.getClinicByClinicianId(clinicianId);
      return result;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch clinics"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Save clinic (add/update)
 */
export const saveClinic = createAsyncThunk(
  "clinic/saveClinic",
  async (model: ClinicModel, { dispatch }) => {
    try {
      dispatch(setSaving(true));
      const response = await clinicService.save(model);

      if (response.success) {
        dispatch(setSuccess(response.message || "Clinic saved successfully!"));
        // Refresh the list if clientId is available
        if (model.clientId) {
          dispatch(fetchClinics({ clientId: model.clientId }) as any);
        }
      } else {
        dispatch(setError(response.message || "Failed to save clinic"));
      }

      return response;
    } catch (error: any) {
      const errorMsg = error.message || "Failed to save clinic";
      dispatch(setError(errorMsg));
      throw error;
    } finally {
      dispatch(setSaving(false));
    }
  }
);

/**
 * Delete clinic
 */
export const removeClinic = createAsyncThunk(
  "clinic/removeClinic",
  async (id: number, { dispatch }) => {
    try {
      dispatch(setSaving(true));
      const response = await clinicService.delete(id);

      if (response.success) {
        dispatch(setSuccess(response.message || "Clinic deleted successfully!"));
      } else {
        dispatch(setError(response.message || "Failed to delete clinic"));
      }

      return response;
    } catch (error: any) {
      const errorMsg = error.message || "Failed to delete clinic";
      dispatch(setError(errorMsg));
      throw error;
    } finally {
      dispatch(setSaving(false));
    }
  }
);
