import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrganizationListItem, OrganizationModel } from '@/services/admin/organization/organizationService';

export interface OrganizationState {
  list:     OrganizationListItem[];
  selected: OrganizationModel | null;  // loaded into edit form
  loading:  boolean;                   // fetching list
  saving:   boolean;                   // save / delete in progress
  success:  boolean;
  error:    string | null;
  message:  string | null;
}

const initialState: OrganizationState = {
  list:     [],
  selected: null,
  loading:  false,
  saving:   false,
  success:  false,
  error:    null,
  message:  null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {

    setLoading: (state) => {
      state.loading = true;
      state.error   = null;
    },

    setSaving: (state) => {
      state.saving = true;
      state.error  = null;
    },

    fetchSuccess: (state, action: PayloadAction<OrganizationListItem[]>) => {
      state.loading = false;
      state.list    = action.payload;
    },

    saveSuccess: (state, action: PayloadAction<string>) => {
      state.saving  = false;
      state.success = true;
      state.message = action.payload;
    },

    deleteSuccess: (state, action: PayloadAction<number>) => {
      state.saving = false;
      state.list   = state.list.filter(o => o.id !== action.payload);
      state.message = 'Deleted successfully';
    },

    setSelected: (state, action: PayloadAction<OrganizationModel | null>) => {
      state.selected = action.payload;
    },

    organizationError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.saving  = false;
      state.error   = action.payload;
    },

    resetOrganizationState: (state) => {
      state.saving  = false;
      state.success = false;
      state.error   = null;
      state.message = null;
    },

    clearError: (state) => {
      state.error = null;
    },

  },
});

export const {
  setLoading,
  setSaving,
  fetchSuccess,
  saveSuccess,
  deleteSuccess,
  setSelected,
  organizationError,
  resetOrganizationState,
  clearError,
} = organizationSlice.actions;

export default organizationSlice.reducer;