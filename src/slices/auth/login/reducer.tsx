import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    user: "",
    error: "",// for error msg
    loading: false,
    isUserLogout: false,
    errorMsg: false,// for error
};

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        setLoading(state) {
            state.loading = true;
            state.error = "";
            state.errorMsg = false;
        },
        loginSuccess(state, action) {
            state.user = action.payload
            state.loading = false;
            state.errorMsg = false;
        },
        apiError(state, action) {
            state.error = action.payload;
            state.loading = false;
            state.isUserLogout = false;
            state.errorMsg = true;
        },
        resetLoginFlag(state) {
            // state.error = null;
            state.error = "";
            state.loading = false;
            state.errorMsg = false;
        },
        logoutUserSuccess(state, _action) {
            state.isUserLogout = true;
            state.loading = false;
            state.error = "";
            state.errorMsg = false;
            state.user = "";
        },
    }
});
export const { setLoading, loginSuccess, apiError, resetLoginFlag, logoutUserSuccess } = loginSlice.actions;
export default loginSlice.reducer;