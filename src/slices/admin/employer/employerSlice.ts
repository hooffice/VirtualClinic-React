import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EmployerList, EmployerModel } from "@/types/admin/employer/employer.type";
import { createBaseState, baseReducers, advancedReducers, resetBaseState } from '@/types/reducer.type';

const initialState = createBaseState<EmployerList,EmployerModel>();

const employerSlice = createSlice({
  name: 'employer',
  initialState,
  reducers: {

    ...baseReducers,      
    ...advancedReducers,  

    setSelected: (state, action: PayloadAction<EmployerModel | null>) => {
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

    resetEmployerState: (state) => {
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
  resetEmployerState,
  clearError,
} = employerSlice.actions;

export default employerSlice.reducer;