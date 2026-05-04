import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClinicListItem } from "@/types/admin/clinic/clinic.types";
import { ClinicianClinicModel } from "@/types/admin/clinician/referalclinic.types";
import { createBaseState, baseReducers, advancedReducers, resetBaseState } from '@/types/reducer.type';

const initialState = createBaseState<ClinicListItem,ClinicianClinicModel>();

const clinicianClinicSlice = createSlice({
  name: 'clinicianclinic',
  initialState,
  reducers: {

    ...baseReducers,      
    ...advancedReducers,  

    setSelected: (state, action: PayloadAction<ClinicianClinicModel | null>) => {
      state.selected = action.payload;
    },     

    saveSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.saving  = false;
      state.success = true;
      state.message = action.payload;
    },    

    deleteSuccess: (state, action: PayloadAction<number>) => {
      state.saving = false;
      state.success = true;
      state.list   = state.list.filter(o => o.id !== action.payload);
      state.message = 'Deleted successfully';
    },    

    resetClinicianClinicState: (state) => {
      resetBaseState(state);
      state.selected = null;
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
  setError,
  resetClinicianClinicState,
  clearError,
} = clinicianClinicSlice.actions;

export default clinicianClinicSlice.reducer;