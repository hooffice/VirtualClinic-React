import { organizationService } from '@/services/admin/organization/organizationService';
import { OrganizationModel } from '@/types/admin/organization/organization.type';
import { getErrorMessage } from '@/types/errors';
import {
  setLoading,
  setSaving,
  fetchSuccess,
  saveSuccess,
  deleteSuccess,
  organizationError,
} from './reducer';

/**
 * Fetch organizations by client ID
 */
export const fetchOrganizations = (clientId: number) => async (dispatch: any) => {
  try {
    dispatch(setLoading());
    const data = await organizationService.getByClientId(clientId);
    dispatch(fetchSuccess(data.data));
  } catch (error) {
    dispatch(organizationError(getErrorMessage(error)));
  }
};

/**
 * Save organization (id = 0 → insert, id > 0 → update)
 */
export const saveOrganization = (model: OrganizationModel, clientId: number) => async (dispatch: any) => {
  try {
    dispatch(setSaving());
    const response = await organizationService.save(model);
    dispatch(saveSuccess(response.message));
    // Refresh list after save
    dispatch(fetchOrganizations(clientId));
  } catch (error) {
    dispatch(organizationError(getErrorMessage(error)));
  }
};

/**
 * Delete organization by ID
 */
export const removeOrganization = (id: number) => async (dispatch: any) => {
  try {
    dispatch(setSaving());
    await organizationService.delete(id);
    dispatch(deleteSuccess(id));   // removes from list without re-fetching
  } catch (error) {
    dispatch(organizationError(getErrorMessage(error)));
  }
};