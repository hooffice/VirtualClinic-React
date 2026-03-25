/**
 * MFA Verification Page
 * Handles 2FA/MFA code verification during login
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert, Card, CardBody } from 'reactstrap';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/types/errors';

const MfaVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [trustDevice, setTrustDevice] = useState(false);
  const [trustDays, setTrustDays] = useState(30); // Default: trust for 30 days
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const userId = searchParams.get('userId');
  const source = searchParams.get('source') || 'login';

  // Validate userId on mount
  useEffect(() => {
    if (!userId) {
      console.error('[MfaVerification] No userId provided');
      setError('Invalid MFA verification request. Please log in again.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [userId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      setError('MFA code expired. Please request a new code.');
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (digits.every((d) => d !== '')) {
      console.log('[MfaVerification] Auto-submitting on 6th digit');
      handleVerify(digits.join(''));
    }
  }, [digits]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept single digit
    const digit = value.replace(/\D/g, '').slice(0, 1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    // Auto-focus to next field if digit entered
    if (digit && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace - move to previous field
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 0);
    }
    // Arrow left
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Arrow right
    else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async (verifyCode?: string) => {
    try {
      const codeToVerify = verifyCode || digits.join('');

      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }

      if (!codeToVerify || codeToVerify.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }

      if (attempts >= 3) {
        setError('Too many failed attempts. Please request a new code or try again later.');
        setLoading(true);
        return;
      }

      console.log('[MfaVerification] Verifying MFA code', { userId, attempt: attempts + 1 });

      setLoading(true);
      setError(null);

      // Call MFA verify endpoint
      console.log('[MfaVerification] Submitting MFA with trust device:', {
        trustDevice,
        trustDays,
        willSendTrustDays: trustDevice ? trustDays : undefined,
      });

      const response = await authService.verifyMfa({
        userId,
        token: codeToVerify,
        method: 'totp',
        TrustDevice: trustDevice,  // Send as PascalCase to match backend
        TrustDays: trustDevice ? trustDays : undefined,
      });

      console.log('[MfaVerification] MFA verification successful', {
        hasCode: !!response.code,
        status: response.status,
      });

      setSuccess(true);

      // Get the authorization code from response
      const authCode = response.Code || response.code;
      const state = response.State || response.state;

      if (authCode && state) {
        console.log('[MfaVerification] Redirecting to OAuth callback with code');
        // Redirect to OAuth callback to exchange code for JWT
        // Always use provider=webapi to call HandleWebApiOAuthCallback handler
        navigate(
          `/oauth-callback?code=${authCode}&state=${state}&provider=mfa`,
          { replace: true }
        );
      } else {
        console.warn('[MfaVerification] No auth code in MFA response');
        setError('MFA verification succeeded but no authorization code received. Please try again.');
        setSuccess(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('[MfaVerification] MFA verification error:', err);
      const errorMessage = getErrorMessage(err);

      // Check for specific error messages
      if (errorMessage.includes('Invalid')) {
        setAttempts((prev) => prev + 1);
        setError(
          `Incorrect code. ${3 - attempts - 1} attempts remaining. Please try again.`
        );
      } else if (errorMessage.includes('expired')) {
        setError('MFA code has expired. Please request a new code.');
      } else {
        setError(errorMessage || 'MFA verification failed. Please try again.');
      }

      setLoading(false);
      setDigits(['', '', '', '', '', '']); // Clear input on error
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error && attempts >= 3) {
    return (
      <React.Fragment>
        <div className="account-pages my-5 pt-sm-5">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <div className="text-center mb-4">
                  <h2 className="text-primary">Virtual Clinic</h2>
                </div>

                <Alert color="danger" className="mb-4">
                  <h5 className="alert-heading">Too Many Attempts</h5>
                  <p className="mb-0">{error}</p>
                </Alert>

                <div className="text-center">
                  <p className="text-muted mb-3">
                    Please try logging in again or contact support if you need help.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/login', { replace: true })}
                  >
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

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <div className="text-center mb-4">
                <h2 className="text-primary fw-bold">Virtual Clinic</h2>
              </div>

              <Card>
                <CardBody className="p-4">
                  <h5 className="mb-3 text-center">Two-Factor Authentication</h5>
                  <p className="text-muted text-center mb-4 small">
                    Enter the 6-digit code from your authenticator app
                  </p>

                  {error && (
                    <Alert color="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert color="success" className="mb-3">
                      ✓ MFA code verified! Redirecting...
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <Label>Authentication Code</Label>
                        <span className={`small ${timeRemaining < 60 ? 'text-danger' : 'text-muted'}`}>
                          Expires in: {formatTime(timeRemaining)}
                        </span>
                      </div>

                      {/* 6 Digit Input Fields */}
                      <div className="d-flex justify-content-center gap-2 mb-3" style={{ gap: '8px' }}>
                        {digits.map((digit, index) => (
                          <Input
                            key={index}
                            innerRef={(el) => {
                              inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={loading || success}
                            autoFocus={index === 0}
                            className="text-center"
                            style={{
                              width: '50px',
                              height: '50px',
                              fontSize: '24px',
                              border: '2px solid #ccc',
                              borderRadius: '8px',
                              transition: 'border-color 0.3s',
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#0066cc';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#ccc';
                            }}
                          />
                        ))}
                      </div>

                      <small className="text-muted d-block text-center mb-3">
                        Enter 6 digits from your authenticator app (auto-submits)
                      </small>
                    </FormGroup>

                    {/* Trust Device Section */}
                    <FormGroup check className="mb-3">
                      <Input
                        id="trust-device"
                        type="checkbox"
                        checked={trustDevice}
                        onChange={(e) => setTrustDevice(e.target.checked)}
                        disabled={loading}
                      />
                      <Label htmlFor="trust-device" className="form-check-label">
                        Trust this device
                      </Label>
                    </FormGroup>

                    {/* Trust Days Selection */}
                    {trustDevice && (
                      <FormGroup className="mb-3">
                        <Label htmlFor="trust-days" className="small text-muted">
                          Trust this device for:
                        </Label>
                        <Input
                          id="trust-days"
                          type="select"
                          value={trustDays}
                          onChange={(e) => setTrustDays(Number(e.target.value))}
                          disabled={loading}
                        >
                          <option value={7}>7 days</option>
                          <option value={14}>14 days</option>
                          <option value={30}>30 days</option>
                          <option value={60}>60 days</option>
                          <option value={90}>90 days</option>
                        </Input>
                        <small className="text-muted d-block mt-2">
                          You won't need to enter a code when logging in from this device during the selected period.
                        </small>
                      </FormGroup>
                    )}

                    <Button
                      type="submit"
                      color="primary"
                      className="w-100"
                      disabled={loading || digits.some((d) => d === '') || success || timeRemaining <= 0}
                    >
                      {loading ? (
                        <>
                          <i className="mdi mdi-loading mdi-spin me-2"></i>
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </Button>
                  </Form>
                </CardBody>
              </Card>

              <div className="mt-4 text-center">
                <p className="text-muted small mb-0">
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0"
                    onClick={() => navigate('/login', { replace: true })}
                  >
                    <i className="mdi mdi-arrow-left me-1"></i>
                    Back to Login
                  </button>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MfaVerification;
