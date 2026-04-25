import { handleAsync } from "@/utils/asyncHandler";
import { EmployerModel } from "@/types/admin/employer/employer.type";
import employerService from "@/services/admin/employer/employerService";
import {
  setLoading,
  setSaving,
  fetchSuccess,
  saveSuccess,
  deleteSuccess,
  setError,
  //resetEmployerState
} from './employerSlice';

/**
 * Fetch employers by client ID
 */
export const fetchEmployers = (clientId: number) => 
  async (dispatch: any) => {
    await handleAsync(
      dispatch,
      () => employerService.getEmployerByClient(clientId),
      {
        setLoading,
        setError,
      },
      (res, dispatch) => {
        dispatch(fetchSuccess(res.data));
      }
    );
  };
/**
 * Save Employer (id = 0 → insert, id > 0 → update)
 */
export const saveEmployer = (model: EmployerModel, clientId: number) => 
  async (dispatch: any) => {
    await handleAsync(
      dispatch, 
      () => employerService.save(model),
      {
        setSaving,
        setError
      },
      async (res, dispatch) => {
        if (!res.success) {
          throw new Error(res.message);
        }
        dispatch(saveSuccess(res.message || "Saved successfully"));
        await dispatch(fetchEmployers(clientId));
      }
    );
  };

/**
 * Delete Employer by ID
 */
export const removeEmployer = (id: number) => async (dispatch: any) => {
  await handleAsync(
    dispatch, 
    () => employerService.delete(id),
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