/**
 * Register Reducer
 * Manages registration form state and API responses
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RegisterState {
  loading: boolean;
  success: boolean;
  error: string | null;
  userId: string | null;
  email: string | null;
  message: string | null;
  emailVerified: boolean;
}

const initialState: RegisterState = {
  loading: false,
  success: false,
  error: null,
  userId: null,
  email: null,
  message: null,
  emailVerified: false,
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    registerSuccess: (state, action: PayloadAction<{ userId: string; email: string; message: string }>) => {
      state.loading = false;
      state.success = true;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.message = action.payload.message;
      state.error = null;
    },

    registerError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    verifyEmailSuccess: (state) => {
      state.emailVerified = true;
      state.message = 'Email verified successfully!';
    },

    verifyEmailError: (state, action: PayloadAction<string>) => {
      state.emailVerified = false;
      state.error = action.payload;
    },

    resetRegisterState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.userId = null;
      state.email = null;
      state.message = null;
      state.emailVerified = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  registerSuccess,
  registerError,
  verifyEmailSuccess,
  verifyEmailError,
  resetRegisterState,
  clearError,
} = registerSlice.actions;

export default registerSlice.reducer;
