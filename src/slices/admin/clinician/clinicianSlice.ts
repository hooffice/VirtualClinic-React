import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClinicianModel, ClinicianList } from "@/types/admin/clinician/clinician.types"
import { createPaginatedState, baseReducers, advancedPageReducers, paginationReducers } from '@/types/reducer.type';


const initialState = createPaginatedState<
  ClinicianList,
  ClinicianModel
>(10);

const clinicianSlice = createSlice({
  name: "Clinician",
  initialState,
  reducers: {
    ...baseReducers,
    ...paginationReducers,
    ...advancedPageReducers,

    setSelected: (state, action: PayloadAction<ClinicianModel | null>) => {
      state.selected = action.payload;
      state.loading = false;
    },
    deleteSuccess: (state, action: PayloadAction<number>) => {
      state.saving = false;
      state.success = true;
      state.list   = state.list.filter(o => o.id !== action.payload);
      state.message = 'Deleted successfully';
    },   
    resetClinicianState: (state) => {
      state.success = false;
      state.message = null;
      state.error = null;
      state.selected = null;
    },   
  },
});

export const {
  setLoading,
  setSaving,
  setListWithPagination,
  setSelected,
  setSuccess,
  setError,
  setPagination,
  deleteSuccess,
  clearError,
  resetClinicianState,
} = clinicianSlice.actions;

export default clinicianSlice.reducer;
