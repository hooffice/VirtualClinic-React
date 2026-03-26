/**
 * Redux Store Type Exports
 * Provides typed dispatch and state selectors for use throughout the app
 */

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/slices';

/**
 * Create store instance
 * Note: This is exported but the actual store initialization happens in src/index.tsx
 */
export const store = configureStore({
  reducer: rootReducer,
  devTools: true,
});

/**
 * Export typed hooks
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
