/**
 * Email Verification Page
 * Verifies email after registration
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
//import { useDispatch, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Container, Row, Col, Card, CardBody, Button, Alert, Spinner } from 'reactstrap';
import { verifyEmailToken, resendVerificationEmail } from '@/slices/auth/register/thunk';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  //const [verified, setVerified] = useState(false);
  const [verified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token');

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token && email) {
      setLoading(true);
      (dispatch as any)(verifyEmailToken(token, email, navigate));
    }
  }, [token, email, dispatch, navigate]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setError(null);

    try {
      (dispatch as any)(resendVerificationEmail(email));
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <div className="text-center mb-4">
                <h2 className="text-primary fw-bold">Virtual Clinic</h2>
                <p className="text-muted">Verify Your Email</p>
              </div>

              <Card>
                <CardBody className="p-4 text-center">
                  {loading && !verified && (
                    <>
                      <Spinner color="primary" className="mb-3" />
                      <h5>Verifying your email...</h5>
                      <p className="text-muted">Please wait while we verify your account.</p>
                    </>
                  )}

                  {verified && (
                    <>
                      <div className="mb-3">
                        <i className="mdi mdi-check-circle text-success" style={{ fontSize: '48px' }}></i>
                      </div>
                      <h5 className="text-success">Email Verified!</h5>
                      <p className="text-muted mb-4">
                        Your email has been verified successfully. You can now log in to your account.
                      </p>
                      <Button
                        color="primary"
                        className="w-100"
                        onClick={() => navigate('/login')}
                      >
                        Go to Login
                      </Button>
                    </>
                  )}

                  {!token && (
                    <>
                      <div className="mb-4">
                        <i className="mdi mdi-email-check" style={{ fontSize: '48px', color: '#0066cc' }}></i>
                      </div>
                      <h5 className="mb-3">Verify Your Email</h5>
                      <p className="text-muted mb-4">
                        We've sent a verification email to <strong>{email}</strong>. Please click the link in
                        the email to verify your account.
                      </p>

                      {error && (
                        <Alert color="danger" className="mb-3">
                          {error}
                        </Alert>
                      )}

                      {resendSuccess && (
                        <Alert color="success" className="mb-3">
                          ✓ Verification email has been resent. Please check your inbox.
                        </Alert>
                      )}

                      <div className="d-grid gap-2">
                        <p className="text-muted small mb-2">Didn't receive the email?</p>
                        <Button
                          color="outline-primary"
                          onClick={handleResendEmail}
                          disabled={resendLoading}
                        >
                          {resendLoading ? (
                            <>
                              <i className="mdi mdi-loading mdi-spin me-2"></i>
                              Sending...
                            </>
                          ) : (
                            'Resend Verification Email'
                          )}
                        </Button>

                        <Button
                          color="secondary"
                          outline
                          onClick={() => navigate('/login')}
                          className="mt-2"
                        >
                          Back to Login
                        </Button>
                      </div>

                      <hr />

                      <p className="small text-muted mb-0">
                        Check your spam folder if you don't see the email in your inbox.
                      </p>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EmailVerification;
