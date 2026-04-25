import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClinicModel, ClinicListItem } from "@/types/admin/clinic/clinic.types";
import { createPaginatedState, baseReducers, advancedPageReducers, paginationReducers } from '@/types/reducer.type';


const initialState = createPaginatedState<
  ClinicListItem,
  ClinicModel
>(10);

const clinicSlice = createSlice({
  name: "Clinic",
  initialState,
  reducers: {
    ...baseReducers,
    ...paginationReducers,
    ...advancedPageReducers,

    fetchSuccess: (state, action: PayloadAction<ClinicListItem[]>) => {
      state.loading = false;
      state.list = action.payload;
    },

    setSelected: (state, action: PayloadAction<ClinicModel | null>) => {
      state.selected = action.payload;
    },

    resetClinicState: (state) => {
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
  fetchSuccess,
  setListWithPagination,
  setSelected,
  setSuccess,
  setError,
  setPagination,
  clearError,
  resetClinicState,
} = clinicSlice.actions;

export default clinicSlice.reducer;
