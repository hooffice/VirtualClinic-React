import { handleAsync } from "@/utils/asyncHandler";
import { ClinicianClinicModel } from "@/types/admin/clinician/referalclinic.types";
import clinicianClinicService from "@/services/admin/clinician/clinicianClinicService";
import {
  setLoading,
  setSaving,
  fetchSuccess,
  saveSuccess,
  deleteSuccess,
  setError,
} from './clinicianClinicSlice';

/**
 * Fetch clinicianClinics by client ID
 */
export const fetchclinicianClinics = (clinicianId: number) => 
  async (dispatch: any) => {
    await handleAsync(
      dispatch,
      () => clinicianClinicService.getReferalClinicbyClinicianById(clinicianId),
      {
        setLoading,
        setError,
      },
      (res, dispatch) => {
        dispatch(fetchSuccess(res));
      }
    );
  };
/**
 * Save clinicianClinic (id = 0 → insert, id > 0 → update)
 */
export const saveclinicianClinic = (model: ClinicianClinicModel, clinicianId: number) => 
  async (dispatch: any) => {
    await handleAsync(
      dispatch, 
      () => clinicianClinicService.save(model),
      {
        setSaving,
        setError
      },
      async (res, dispatch) => {
        if (!res.success) {
          throw new Error(res.message);
        }
        dispatch(saveSuccess(res.message || "Saved successfully"));
        await dispatch(fetchclinicianClinics(clinicianId));
      }
    );
  };

/**
 * Delete clinicianClinic by ID
 */
export const removeclinicianClinic = (id: number) => async (dispatch: any) => {
  await handleAsync(
    dispatch, 
    () => clinicianClinicService.delete(id),
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