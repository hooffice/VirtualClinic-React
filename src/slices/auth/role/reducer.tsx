import { createSlice } from "@reduxjs/toolkit";

export type UserRole = "admin" | "clinician" | "patient" | "ancillary" | "subadmin";

export const initialState = {
    role: "admin" as UserRole,
    loading: false,
};

const roleSlice = createSlice({
    name: "role",
    initialState,
    reducers: {
        setUserRole(state, action) {
            state.role = action.payload;
            state.loading = false;
        },
        resetRole(state) {
            state.role = "admin";
            state.loading = false;
        },
    },
});

export const { setUserRole, resetRole } = roleSlice.actions;
export default roleSlice.reducer;
