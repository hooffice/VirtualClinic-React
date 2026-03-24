import { getFirebaseBackend } from "helpers/firebase_helper";
import { setLoading, loginSuccess, apiError, logoutUserSuccess, resetLoginFlag } from "./reducer";
import { ENV } from "config/env";
import { useAuthStore } from "store/useAuthStore";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/types/errors";

export const loginuser = (user: any, history: any) => async (dispatch: any) => {
    try {
        console.log('[Thunk] loginuser called', { email: user.email });
        console.log('[Thunk] AUTH_MODE:', ENV.REACT_APP_DEFAULTAUTH);

        // Set loading to true to show progress bar and disable UI
        dispatch(setLoading());

        let response: any;

        if (ENV.REACT_APP_DEFAULTAUTH === "firebase") {
            console.log('[Thunk] Using Firebase backend');
            let fireBaseBackend = await getFirebaseBackend();
            response = fireBaseBackend.loginUser(user.email, user.password);
        } else if (ENV.REACT_APP_DEFAULTAUTH === "jwt") {
            console.log('[Thunk] Using JWT authService (OAuth 2 flow)');
            // Use production VC API with OAuth 2 flow
            response = await authService.login({
                email: user.email,
                password: user.password,
            });

            console.log('[Thunk] authService.login response:', {
                hasAccessToken: !!response.accessToken,
                hasUser: !!response.user,
                status: response.status,
            });

            // Check if MFA is required
            if (response.status === 'RequiresMfa' || response.Status === 'RequiresMfa') {
                console.log('[Thunk] MFA required, redirecting to MFA verification');
                const authStore = useAuthStore.getState();
                authStore.setMfaRequired(response.UserId || response.userId);
                history(`/mfa-verification?userId=${response.UserId || response.userId}&source=login`);
                return;
            }

            // Store in Zustand
            const authStore = useAuthStore.getState();

            // Store both access and refresh tokens
            authStore.setTokens(
                response.accessToken || '',
                response.refreshToken || ''
            );
            console.log('[Thunk] Tokens stored in Zustand:', {
                hasAccessToken: !!response.accessToken,
                hasRefreshToken: !!response.refreshToken,
            });

            // Store user info
            authStore.setUser({
                username: response.user?.userName,
                email: response.user?.email,
                uid: response.user?.id,
                displayName: response.user?.userName,
            });

            // Dispatch Redux success
            dispatch(loginSuccess(response));
        } else {
            console.log('[Thunk] Using fake backend (dev mode)');
            // This is for development/testing only
            throw new Error('Fake backend not implemented. Please use jwt mode.');
        }

        console.log('[Thunk] Login successful, navigating to dashboard');
        history('/dashboard');
    } catch (error) {
        console.error('[Thunk] Login error:', error);
        const errorMessage = getErrorMessage(error);
        dispatch(apiError(errorMessage));
    }
}

export const logoutUser = () => async (dispatch: any) => {
    try {
        console.log('[Thunk] logoutUser started');
        // Call backend logout if using JWT
        if (ENV.REACT_APP_DEFAULTAUTH === "jwt") {
            console.log('[Thunk] Calling authService.logout()');
            await authService.logout();
            console.log('[Thunk] Backend logout completed');
        } else if (ENV.REACT_APP_DEFAULTAUTH === "firebase") {
            const fireBaseBackend = getFirebaseBackend();
            await fireBaseBackend.logout();
        }
        // Clear localStorage
        localStorage.removeItem("authUser");
        console.log('[Thunk] localStorage cleared');

        // Clear Zustand store
        const authStore = useAuthStore.getState();
        authStore.logout();
        console.log('[Thunk] Zustand store cleared');
        console.log('[Thunk] Logout successful, dispatching logoutUserSuccess');
        dispatch(logoutUserSuccess(true));
    } catch (error) {
        console.error('[Thunk] Logout error:', error);
        // Clear state even if logout fails
        localStorage.removeItem("authUser");
        const authStore = useAuthStore.getState();
        authStore.logout();
        dispatch(logoutUserSuccess(true));
    }
};

export const resetLoginMsgFlag = () => {
    try {
        const response = resetLoginFlag();
        return response;
    } catch (error) {
        return error;
    }
};


export const socialLogin = (type: any, history: any) => async (dispatch: any) => {
    try {
        let response: any;

        if (ENV.REACT_APP_DEFAULTAUTH === "firebase") {
            const fireBaseBackend = getFirebaseBackend();
            response = fireBaseBackend.socialLoginUser(type);
        }

        const socialdata = await response;
        if (socialdata) {
            sessionStorage.setItem("authUser", JSON.stringify(socialdata));
            dispatch(loginSuccess(socialdata));
            history('/dashboard');
        }

    } catch (error) {
        dispatch(apiError(error));
    }
};