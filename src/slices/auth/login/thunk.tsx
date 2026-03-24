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

            // Step 1: POST /api/oauth/login to get authorization code
            response = await authService.login({
                email: user.email,
                password: user.password,
            });

            const status = response.status || response.Status;
            const statusString = String(status).toLowerCase();
            const code = response.code || response.Code;
            const state = response.state || response.State;
            const userId = response.userId || response.UserId;
            const twoFactorEnabled = response.twoFactorEnabled || response.TwoFactorEnabled;
            const message = response.message || response.Message || '';

            console.log('[Thunk] Login response received:', {
                status,
                statusString,
                hasCode: !!code,
                message,
                twoFactorEnabled,
            });

            // AuthStatus enum from backend:
            // 0 = Failed
            // 1 = RequiresMfa (modern MFA)
            // 2 = Authenticated
            // 3 = TwoFARequired (legacy 2FA setup needed)

            // Case 1: MFA is required (status: 1 = RequiresMfa)
            const isMfaRequired = statusString === 'requiresmfa' || status === 1;

            if (isMfaRequired) {
              console.log('[Thunk] MFA required, redirecting to MFA verification');
              const authStore = useAuthStore.getState();
              authStore.setMfaRequired(userId);
              history(`/mfa-verification?userId=${userId}&source=login`);
              return;
            }

            // Case 2: Legacy 2FA setup required (status: 3 = TwoFARequired)
            const isTwoFARequired = statusString === 'twofarequired' || status === 3;

            if (isTwoFARequired) {
              console.log('[Thunk] 2FA setup required, redirecting to MFA setup');
              history(`/mfa-setup?userId=${userId}&fromLogin=true`);
              return;
            }

            // Case 3: Authorization code received (need to exchange via callback)
            if (code && state) {
              console.log('[Thunk] Authorization code received, redirecting to OAuth callback');
              history(`/oauth-callback?code=${code}&state=${state}&provider=webapi`);
              return;
            }

            // Case 4: Login failed (status: 0 = Failed)
            const isFailed = statusString === 'failed' || status === 0;
            if (isFailed) {
              console.error('[Thunk] Login failed:', message);
              throw new Error(message || 'Login failed. Please try again.');
            }

            // Fallback: unexpected response
            console.error('[Thunk] Unexpected login response:', response);
            throw new Error('Unexpected login response. Please try again.');
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