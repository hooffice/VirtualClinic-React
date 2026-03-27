/**
 * OAuth Callback Page
 * Handles authorization code exchange for JWT token
 * Supports multiple providers: webapi, mfa, google, github
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
//import { Container, Row, Col, Spinner, Alert } from 'reactstrap';
import { Container, Row, Col, Alert } from 'reactstrap';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/types/errors';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Processing your login...');

  useEffect(() => {
    const exchangeCode = async () => {
      try {
        // Extract parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const provider = searchParams.get('provider') || 'webapi';
        const isTrusted = searchParams.get('trustedDevice') || '';
        const trustedDevice = isTrusted == '' ? false : true;

        console.log('[OAuthCallback] Starting code exchange', {
          hasCode: !!code,
          hasState: !!state,
          provider,
          trustedDevice
        });

        // Validate parameters
        if (!code || !state) {
          console.error('[OAuthCallback] Missing required parameters');
          setError(
            'Invalid callback URL. Missing authorization code or state. Please try logging in again.'
          );
          setLoading(false);
          return;
        }

        // Step 1: Exchange code for tokens
        setProgress(20);
        setMessage('Validating authorization code...');

        console.log('[OAuthCallback] Exchanging code for tokens', {
          code: code.substring(0, 20) + '...',
          state: state.substring(0, 20) + '...',
          provider,
          trustedDevice
        });

        const response = await authService.exchangeCodeForToken({
          code,
          state,
          provider,
          trustedDevice
        });

        console.log('[OAuthCallback] Exchange response received:', {
          hasAccessToken: !!response.accessToken || !!response.AccessToken,
          hasUser: !!response.user || !!response.User,
          status: response.status || response.Status,
          statusCode: response.status === 'RequiresMfa' ? 1 : (response.status === 'Authenticated' ? 2 : '?'),
          fullResponse: JSON.stringify(response, null, 2),
        });

        // Step 2: Check if MFA is still required (shouldn't happen, but safety check)
        if (response.status === 'RequiresMfa' || response.Status === 'RequiresMfa') {
          console.warn('[OAuthCallback] MFA required from callback (unexpected)');
          const authStore = useAuthStore.getState();
          const userId = response.userId ?? response.UserId ?? "";
          authStore.setMfaRequired(userId);
          navigate(`/mfa-verification?userId=${response.userId || response.UserId}`);
          return;
        }

        // Step 3: Store tokens in Zustand
        setProgress(60);
        setMessage('Storing authentication tokens...');

        const accessToken = response.accessToken || response.AccessToken;
        const refreshToken = response.refreshToken || response.RefreshToken;

        if (!accessToken) {
          console.error('[OAuthCallback] No access token in response');
          setError('Authentication failed. No token received. Please try logging in again.');
          setLoading(false);
          return;
        }

        const authStore = useAuthStore.getState();
        authStore.setTokens(accessToken, refreshToken || '');

        console.log('[OAuthCallback] ✅ Tokens stored in Zustand');

        // Step 4: Store user in localStorage
        setProgress(80);
        setMessage('Finalizing login...');

        const userToStore = response.user || response.User;
        if (userToStore) {
          localStorage.setItem('authUser', JSON.stringify(userToStore));
          console.log('[OAuthCallback] ✅ User stored in localStorage');
        }

        // Step 5: Complete progress and redirect
        setProgress(100);
        console.log('[OAuthCallback] ✅ Authentication complete, redirecting to dashboard');

        // Wait 2 seconds for visual feedback, then redirect
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } catch (err) {
        console.error('[OAuthCallback] Error during code exchange:', err);
        const errorMessage = getErrorMessage(err);
        setError(errorMessage || 'An error occurred during authentication. Please try logging in again.');
        setLoading(false);
      }
    };

    exchangeCode();
  }, [navigate, searchParams]);

  // Error state
  if (error) {
    return (
      <React.Fragment>
        <div className="account-pages my-5 pt-sm-5">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <div className="text-center mb-4">
                  {/* Company Logo - Replace with your actual logo */}
                  <div className="mb-3">
                    <h2 className="text-primary">Virtual Clinic</h2>
                  </div>
                </div>

                <Alert color="danger" className="mb-4">
                  <h5 className="alert-heading">Authentication Error</h5>
                  <p className="mb-0">{error}</p>
                </Alert>

                <div className="text-center">
                  <p className="text-muted mb-3">
                    There was a problem with your login. Please try again.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/login', { replace: true })}
                  >
                    <i className="mdi mdi-arrow-left me-2"></i>
                    Back to Login
                  </button>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }

  // Loading state
  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <div className="text-center">
                {/* Company Logo - Replace with your actual logo */}
                <div className="mb-4">
                  <h2 className="text-primary fw-bold">Virtual Clinic</h2>
                </div>

                {/* Spinner */}
                <div className="mb-4 pt-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>

                {/* Message */}
                <h5 className="mb-2 text-secondary">{message}</h5>
                <p className="text-muted mb-4">
                  {progress < 50 && 'Validating your credentials...'}
                  {progress >= 50 && progress < 100 && 'Setting up your session...'}
                  {progress === 100 && 'Redirecting to dashboard...'}
                </p>

                {/* Progress Bar */}
                <div className="progress mb-3" style={{ height: '4px' }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>

                {/* Status */}
                <p className="text-muted small">
                  {progress === 0 && 'Initializing...'}
                  {progress === 20 && '✓ Request received'}
                  {progress === 60 && '✓ Request received • ✓ Token validated'}
                  {progress === 80 && '✓ Request received • ✓ Token validated • ✓ Session created'}
                  {progress === 100 && '✓ Complete'}
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default OAuthCallback;
