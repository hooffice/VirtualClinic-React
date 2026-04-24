import { PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse, PaginatedApiResponse } from"@/types/api.types";

export interface BaseEntityState<TList, TModel> {
  list: TList[];
  selected: TModel | null;
  loading: boolean;
  saving: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}

export interface PaginatedState {
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalRecords: number;
}

export const createBaseState = <TList, TModel>(): BaseEntityState<TList, TModel> => ({
  list: [],
  selected: null,
  loading: false,
  saving: false,
  success: false,
  error: null,
  message: null,
});

const DEFAULT_PAGE_SIZE = 10;

export const createPaginatedState = <TList, TModel>(
  pageSize: number = DEFAULT_PAGE_SIZE
): BaseEntityState<TList, TModel> & PaginatedState => ({
  ...createBaseState<TList, TModel>(),
  totalPages: 0,
  currentPage: 1,
  pageSize,
  totalRecords: 0,
});

export const baseReducers = {
  setLoading: <TList, TModel>(state: BaseEntityState<TList, TModel>) => {
    state.loading = true;
    state.error = null;
    state.success = false;
  },

  setSaving: <TList, TModel>(state: BaseEntityState<TList, TModel>) => {
    state.saving = true;
    state.error = null;
    state.success = false;
  },

  setSuccess: <TList, TModel>(
    state: BaseEntityState<TList, TModel>,
    action: PayloadAction<string>
  ) => {
    state.success = true;
    state.message = action.payload;
    state.loading = false;
    state.saving = false;
  },

  setError: <TList, TModel>(
    state: BaseEntityState<TList, TModel>,
    action: PayloadAction<string>
  ) => {
    state.error = action.payload;
    state.success = false;
    state.loading = false;
    state.saving = false;
  },

  clearError: <TList, TModel>(state: BaseEntityState<TList, TModel>) => {
    state.error = null;
  }
};

export const paginationReducers = {
  setPagination: <TList, TModel>(
    state: BaseEntityState<TList, TModel> & PaginatedState,
    action: PayloadAction<Partial<PaginatedState>>
  ) => {
    const { currentPage, totalPages, pageSize, totalRecords } = action.payload;

    if (currentPage !== undefined) state.currentPage = currentPage;
    if (totalPages !== undefined) state.totalPages = totalPages;
    if (pageSize !== undefined) state.pageSize = pageSize;
    if (totalRecords !== undefined) state.totalRecords = totalRecords;
  }
};

export const resetBaseState = <TList, TModel>(
  state: BaseEntityState<TList, TModel>
) => {
  state.loading = false;
  state.saving = false;
  state.success = false;
  state.error = null;
  state.message = null;
};

export const advancedReducers = {
  fetchSuccess: <TList, TModel>(
    state: BaseEntityState<TList, TModel>,
    action: PayloadAction<ApiResponse<TList[]>>
  ) => {
    const { data, success } = action.payload;

    state.list = Array.isArray(data) ? data : [];

    state.loading = false;
    state.saving = false;
    state.success = success ?? true;
    state.error = null;
  },
};


export const advancedPageReducers = {
  setListWithPagination: <TList>(
    state:  BaseEntityState<TList, any> & PaginatedState,
    action: PayloadAction<PaginatedApiResponse<TList>>
  ) => {
    const { data, currentPage, totalPages, pageSize, totalRecords, message } =
      action.payload;

    state.list = data;

    state.currentPage = currentPage;
    state.totalPages = totalPages;
    state.pageSize = pageSize;
    state.totalRecords = totalRecords;

    state.loading = false;
    state.success = true;
    state.message = message ?? null;
    state.error = null;
  },
};