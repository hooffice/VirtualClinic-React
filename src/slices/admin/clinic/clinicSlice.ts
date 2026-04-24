import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClinicModel, ClinicListItem } from "@/types/admin/clinic/clinic.types";

import { createPaginatedState, baseReducers, advancedPageReducers, paginationReducers } from '@/types/reducer.type';
import { fetchClinics, saveClinic, removeClinic } from "./clinicThunk";

// export interface ClinicState {
//   list: ClinicListItem[];
//   loading: boolean;
//   saving: boolean;
//   success: boolean;
//   error: string | null;
//   message: string | null;
//   selected: ClinicModel | null;
//   totalPages: number;
//   currentPage: number;
//   pageSize: number;
//   totalRecords: number;
// }

// const initialState: ClinicState = {
//   list: [],
//   loading: false,
//   saving: false,
//   success: false,
//   error: null,
//   message: null,
//   selected: null,
//   totalPages: 0,
//   currentPage: 1,
//   pageSize: 50,
//   totalRecords: 0,
// };

const initialState = createPaginatedState<
  ClinicListItem,
  ClinicModel
>(50);

const clinicSlice = createSlice({
  name: "Clinic",
  initialState,
  reducers: {
    // // Set loading state
    // setLoading: (state, action: PayloadAction<boolean>) => {
    //   state.loading = action.payload;
    // },

    // // Set saving state
    // setSaving: (state, action: PayloadAction<boolean>) => {
    //   state.saving = action.payload;
    // },

    // // Set clinic list
    // setList: (state, action: PayloadAction<ClinicListItem[]>) => {
    //   state.list = action.payload;
    // },
   // // Set success message
    // setSuccess: (state, action: PayloadAction<string>) => {
    //   state.success = true;
    //   state.message = action.payload;
    // },

    // // Set error
    // setError: (state, action: PayloadAction<string>) => {
    //   state.error = action.payload;
    //   state.success = false;
    // },

    // // Set pagination
    // setPagination: (
    //   state,
    //   action: PayloadAction<{ currentPage: number; totalPages: number; pageSize: number; totalRecords?: number }>
    // ) => {
    //   state.currentPage = action.payload.currentPage;
    //   state.totalPages = action.payload.totalPages;
    //   state.pageSize = action.payload.pageSize;
    //   if (action.payload.totalRecords !== undefined) {
    //     state.totalRecords = action.payload.totalRecords;
    //   }
    // },    
    ...baseReducers,            // loading, saving, success, error
    ...paginationReducers,      // setPagination
    ...advancedPageReducers,    // setListWithPagination

  fetchSuccess: (state, action: PayloadAction<ClinicListItem[]>) => {
      state.loading = false;
      state.list    = action.payload;
    },
    // Set selected clinic
    setSelected: (state, action: PayloadAction<ClinicModel | null>) => {
      state.selected = action.payload;
    },

 

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetClinicState: (state) => {
      state.success = false;
      state.message = null;
      state.error = null;
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchClinics
    builder.addCase(fetchClinics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchClinics.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchClinics.rejected, (state) => {
      state.loading = false;
    });

    // Handle saveClinic
    builder.addCase(saveClinic.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(saveClinic.fulfilled, (state) => {
      state.saving = false;
    });
    builder.addCase(saveClinic.rejected, (state) => {
      state.saving = false;
    });

    // Handle removeClinic
    builder.addCase(removeClinic.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(removeClinic.fulfilled, (state) => {
      state.saving = false;
    });
    builder.addCase(removeClinic.rejected, (state) => {
      state.saving = false;
    });
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
