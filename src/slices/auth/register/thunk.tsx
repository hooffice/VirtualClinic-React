/**
 * Register Thunk
 * Handles registration API calls and state management
 */

import { RegistrationRequest } from '@/types/api.types';
import { registrationService } from '@/services/registrationService';
import { getErrorMessage } from '@/types/errors';
import { 
  setLoading, 
  registerSuccess, 
  registerError,
  verifyEmailSuccess,
  verifyEmailError 
} from './reducer';

/**
 * Register new user (Patient or Clinician)
 */
export const registerUser = (data: RegistrationRequest) => async (dispatch: any) => {
  try {
    console.log('[RegisterThunk] registerUser() called', { email: data.email, userType: data.userType });

    dispatch(setLoading());

    // Call registration service
    const response = await registrationService.register(data);

    console.log('[RegisterThunk] Registration successful:', {
      userId: response.userId,
      message: response.message,
    });

    // Dispatch success action
    dispatch(registerSuccess({
      userId: response.userId,
      email: data.email,
      message: response.message,
    }));

  } catch (error) {
    console.error('[RegisterThunk] Registration error:', error);
    const errorMessage = getErrorMessage(error);
    dispatch(registerError(errorMessage));
  }
};

/**
 * Verify email with confirmation token
 */
export const verifyEmailToken = (token: string, email: string, history: any) => async (dispatch: any) => {
  try {
    console.log('[RegisterThunk] verifyEmailToken() called');

    dispatch(setLoading());

    // Call verification service
    const response = await registrationService.verifyEmail(token, email);

    console.log('[RegisterThunk] Email verified successfully');

    dispatch(verifyEmailSuccess());

    // Redirect to login with success message
    setTimeout(() => {
      history('/login', { 
        state: { message: 'Email verified! You can now log in.' }
      });
    }, 2000);

  } catch (error) {
    console.error('[RegisterThunk] Email verification error:', error);
    const errorMessage = getErrorMessage(error);
    dispatch(verifyEmailError(errorMessage));
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = (email: string) => async (dispatch: any) => {
  try {
    console.log('[RegisterThunk] resendVerificationEmail() called');

    dispatch(setLoading());

    const response = await registrationService.resendVerificationEmail(email);

    console.log('[RegisterThunk] Verification email resent');
    
    dispatch(registerSuccess({
      userId: '',
      email: email,
      message: response.message || 'Verification email sent. Please check your inbox.',
    }));

  } catch (error) {
    console.error('[RegisterThunk] Resend verification error:', error);
    const errorMessage = getErrorMessage(error);
    dispatch(registerError(errorMessage));
  }
};
