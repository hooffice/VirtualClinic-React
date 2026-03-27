/**
 * MFA Setup Page
 * Guides legacy 2FA users through MFA setup process
 * QR code scanning + verification
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  //Label,
  Input,
  Button,
  Alert,
  Card,
  CardBody,
  Spinner,
} from 'reactstrap';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/types/errors';

type SetupStep = 'loading' | 'setup' | 'verify' | 'success';

const MfaSetup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<SetupStep>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  //const [showSecret, setShowSecret] = useState(false);

  const userId = searchParams.get('userId');
  //const fromLogin = searchParams.get('fromLogin') === 'true';

  // Initialize MFA setup
  useEffect(() => {
    const initializeSetup = async () => {
      try {
        if (!userId) {
          setError('Invalid setup request. User ID not found.');
          setStep('setup');
          return;
        }

        console.log('[MfaSetup] Initializing MFA setup for user:', userId);
        setStep('loading');

        // Call backend to generate QR code and secret
        const response = await authService.setupMfa(userId);

        console.log('[MfaSetup] Setup initialized', {
          hasSecret: !!response.secretKey,
          hasQrCode: !!response.qrCodeUrl,
        });

        setSecretKey(response.secretKey || '');
        setQrCodeUrl(response.qrCodeUrl || '');
        setStep('setup');
      } catch (err) {
        console.error('[MfaSetup] Setup initialization error:', err);
        setError(getErrorMessage(err));
        setStep('setup');
      }
    };

    initializeSetup();
  }, [userId]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    setCode(value);
    setError(null);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!userId) {
        setError('User ID not found. Please try again.');
        return;
      }

      if (!code || code.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }

      console.log('[MfaSetup] Verifying MFA code');
      setLoading(true);
      setError(null);

      // Call enable MFA endpoint
      await authService.enableMfa(userId, code);

      console.log('[MfaSetup] ✅ MFA enabled successfully');
      setStep('success');
      setLoading(false);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message: 'MFA setup complete! Please log in with your credentials and 6-digit code.',
          },
        });
      }, 3000);
    } catch (err) {
      console.error('[MfaSetup] MFA enable error:', err);
      const errorMessage = getErrorMessage(err);

      if (errorMessage.includes('Invalid')) {
        setError('Incorrect code. Please check your authenticator app and try again.');
      } else if (errorMessage.includes('expired')) {
        setError('Setup session expired. Please refresh and try again.');
      } else {
        setError(errorMessage);
      }

      setLoading(false);
      setCode('');
    }
  };

  // Loading state
  if (step === 'loading') {
    return (
      <React.Fragment>
        <div className="my-5 pt-sm-5">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <div className="text-center">
                  <h2 className="text-primary fw-bold mb-4">Virtual Clinic</h2>
                  <Spinner color="primary" />
                  <p className="text-muted mt-3">Initializing MFA setup...</p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <React.Fragment>
        <div className="my-5 pt-sm-5">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="text-center">
                  <CardBody className="p-4">
                    <div className="mb-3">
                      <i
                        className="mdi mdi-check-circle text-success"
                        style={{ fontSize: '48px' }}
                      ></i>
                    </div>

                    <h5 className="mb-3">MFA Setup Complete!</h5>
                    <p className="text-muted mb-4">
                      Your account is now protected with two-factor authentication.
                    </p>

                    <Alert color="info" className="mb-4">
                      <small>
                        You will now need to enter a 6-digit code from your authenticator app
                        each time you log in.
                      </small>
                    </Alert>

                    <p className="text-muted small mb-0">
                      Redirecting to login in 3 seconds...
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }

  // Setup step
  return (
    <React.Fragment>
      <div className="my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <div className="text-center mb-4">
                <h2 className="text-primary fw-bold">Virtual Clinic</h2>
              </div>

              <Card>
                <CardBody className="p-4">
                  <h5 className="mb-3 text-center">Set Up Two-Factor Authentication</h5>

                  {error && <Alert color="danger" className="mb-3">{error}</Alert>}

                  {/* Step 1: Scan QR Code */}
                  <div className="mb-4">
                    <h6 className="mb-2">Step 1: Scan QR Code</h6>
                    <p className="text-muted small mb-3">
                      Open your authenticator app (Google Authenticator, Microsoft Authenticator,
                      Authy, etc.) and scan this QR code:
                    </p>

                    {qrCodeUrl ? (
                      <div className="text-center mb-3">
                        <img
                          src={qrCodeUrl}
                          alt="MFA QR Code"
                          style={{
                            maxWidth: '200px',
                            border: '1px solid #ddd',
                            padding: '10px',
                            borderRadius: '5px',
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center mb-3 p-3 bg-light">
                        <Spinner size="sm" color="primary" />
                        <p className="text-muted small mt-2">Loading QR code...</p>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-4 position-relative">
                    <hr className="m-0" />
                    <span className="bg-white px-2 position-absolute top-50 start-50 translate-middle text-muted small">
                      OR
                    </span>
                  </div>

                  {/* Step 2: Manual Entry */}
                  <div className="mb-4">
                    <h6 className="mb-2">Step 2: Manual Entry</h6>
                    <p className="text-muted small mb-2">
                      Can't scan? Enter this key manually:
                    </p>
                    <div className="position-relative">
                      <Input
                        type="text"
                        readOnly
                        value={secretKey}
                        className="form-control-plaintext font-monospace"
                        style={{
                          backgroundColor: '#f8f9fa',
                          padding: '10px',
                          borderRadius: '5px',
                          border: '1px solid #dee2e6',
                          wordBreak: 'break-all',
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2"
                        onClick={() => {
                          navigator.clipboard.writeText(secretKey);
                        }}
                        title="Copy to clipboard"
                      >
                        <i className="mdi mdi-content-copy"></i>
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="my-4" />

                  {/* Step 3: Verify */}
                  <Form onSubmit={handleVerify}>
                    <h6 className="mb-3">Step 3: Verify Code</h6>
                    <p className="text-muted small mb-3">
                      Enter the 6-digit code from your authenticator app:
                    </p>

                    <FormGroup>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        value={code}
                        onChange={handleCodeChange}
                        disabled={loading}
                        autoFocus
                        maxLength={6}
                        className="text-center fs-3"
                        style={{ letterSpacing: '10px', fontSize: '28px' }}
                      />
                      <small className="text-muted">Enter 6 digits</small>
                    </FormGroup>

                    <Button
                      type="submit"
                      color="primary"
                      className="w-100"
                      disabled={loading || code.length !== 6}
                    >
                      {loading ? (
                        <>
                          <i className="mdi mdi-loading mdi-spin me-2"></i>
                          Verifying...
                        </>
                      ) : (
                        'Verify & Enable MFA'
                      )}
                    </Button>
                  </Form>

                  <Alert color="warning" className="mt-4 mb-0">
                    <small>
                      <strong>Important:</strong> Save your backup codes in a secure location. You'll
                      need them if you lose access to your authenticator app.
                    </small>
                  </Alert>
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
                    Skip for now
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

export default MfaSetup;
