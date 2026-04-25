import { createAsyncThunk } from "@reduxjs/toolkit";
import { clinicService } from "@/services/admin/clinic/clinicService";
import { ClinicModel } from "@/types/admin/clinic/clinic.types";
import {
  setLoading,
  setSaving,
  setListWithPagination,
  setSuccess,
  setError,
  //setPagination,
  fetchSuccess,
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
      dispatch(setLoading());
      const response = await clinicService.getClinicsByPaginated(
        params.clientId,
        params.pageNumber || 1,
        params.pageSize || 10,
        params.search || ""
      );

     const payload = {
           data: response.data,
           currentPage: params.pageNumber || 1,  // Use requested page, not response
           totalPages: response.xpage.totalPages,
           pageSize: response.xpage.pageSize,
           totalRecords: response.xpage.totalRecords,
           //message: "Clinics loaded successfully",
      };

      dispatch(setListWithPagination(payload));

      console.log("Clinics loaded:", response.data.length, "items | Page:", params.pageNumber || 1);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching clinics:", error.message);
      dispatch(setError(error.message || "Failed to fetch clinics"));
      throw error;
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
      dispatch(setLoading());
      const result = await clinicService.getClinicByClient(clientId);
      dispatch(fetchSuccess(result.data))
      //console.log("Clinics by client loaded:", result.data.length, "items");
      return result;
    } catch (error: any) {
      console.error("Error fetching clinics by client:", error.message);
      dispatch(setError(error.message || "Failed to fetch clinics"));
      throw error;
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
      dispatch(setLoading());
      const result = await clinicService.getClinicByClinicianId(clinicianId);
      dispatch(fetchSuccess(result.data));
      //console.log("Clinics by clinician loaded:", result.data.length, "items");
      return result;
    } catch (error: any) {
      console.error("Error fetching clinics by clinician:", error.message);
      dispatch(setError(error.message || "Failed to fetch clinics"));
      throw error;
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
      dispatch(setSaving());
      const response = await clinicService.save(model);

      if (response.success) {
        //console.log("Clinic saved:", response.message);
        dispatch(setSuccess(response.message || "Clinic saved successfully!"));
        return response;
      } else {
        console.warn("Save failed:", response.message);
        dispatch(setError(response.message || "Failed to save clinic"));
        throw new Error(response.message || "Failed to save clinic");
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to save clinic";
      console.error("Error saving clinic:", errorMsg);
      dispatch(setError(errorMsg));
      throw error;
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
      dispatch(setSaving());
      const response = await clinicService.delete(id);

      if (response.success) {
        console.log("Clinic deleted:", response.message);
        dispatch(setSuccess(response.message || "Clinic deleted successfully!"));
      } else {
        console.warn("Delete failed:", response.message);
        dispatch(setError(response.message || "Failed to delete clinic"));
      }

      return response;
    } catch (error: any) {
      const errorMsg = error.message || "Failed to delete clinic";
      console.error("Error deleting clinic:", errorMsg);
      dispatch(setError(errorMsg));
      throw error;
    }
  }
);
