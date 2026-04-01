import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Label,
  FormGroup,
  FormText,
  Alert,
} from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import PasswordStrengthIndicator from '@/Components/PasswordStrengthIndicator';
import { registerUser } from '@/slices/auth/register/thunk';
import { RootState, AppDispatch } from '@/store';
import { timezoneService, Timezone } from '@/services/timezoneService';
import { affiliationService, Affiliation } from '@/services/affiliationService';
import { referredByService, ReferredBy } from '@/services/referredByService';
import { salesRepService, SalesRep } from '@/services/salesRepService';
import { emailService } from '@/services/emailService';
import './Register.css';

interface FormData {
  userType: number | null;
  email: string;
  firstName: string;
  lastName: string;
  contact: string;
  timezone: string;
  // Clinician-specific
  credential: string;
  hasNpi: boolean;
  npiNo: string;
  cliaCertification: boolean;
  cliaCertificationNo: string;
  affiliation: string;
  referredBy: number | null; // Clinician only
  referredbyOther: string; // if referredBy = other - id: 8
  salesRep: number | null; // Clinician only
}

interface ValidationErrors {
  [key: string]: string;
}

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, success, email } = useSelector(
    (state: RootState) => state.register
  );

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    userType: 3,
    email: '',
    firstName: '',
    lastName: '',
    contact: '',
    timezone: 'Eastern Standard Time',
    credential: '',
    hasNpi: false,
    npiNo: '',
    cliaCertification: false,
    cliaCertificationNo: '',
    affiliation: 'None',
    referredBy: null,
    referredbyOther: '',
    salesRep: null,
  });

  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [timezonesLoading, setTimezonesLoading] = useState(false);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [referredByList, setReferredByList] = useState<ReferredBy[]>([]);
  const [salesRepList, setSalesRepList] = useState<SalesRep[]>([]);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  // Fetch reference data on component mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch timezones
        setTimezonesLoading(true);
        const timezonesData = await timezoneService.getTimezones();
        setTimezones(timezonesData);

        // Fetch affiliations
        const affiliationsData = await affiliationService.getAffiliations();
        setAffiliations(affiliationsData);

        // Fetch referred by list
        const referredByData = await referredByService.getReferredByList();
        setReferredByList(referredByData);

        // Fetch sales rep list
        const salesRepData = await salesRepService.getSalesRepList();
        setSalesRepList(salesRepData);
      } catch (err) {
        console.error('Failed to fetch reference data:', err);
        setTimezones([]);
        setAffiliations([]);
        setReferredByList([]);
        setSalesRepList([]);
      } finally {
        setTimezonesLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  // Check email availability (debounced)
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && validateEmail(formData.email)) {
        setEmailChecking(true);
        const exists = await emailService.checkEmailExists(formData.email);
        setEmailExists(exists);
        setEmailChecking(false);
      } else {
        setEmailExists(false);
      }
    };

    // Debounce email check - wait 500ms after user stops typing
    const timer = setTimeout(() => {
      checkEmail();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Redirect to email verification on success
  useEffect(() => {
    if (success && email) {
      const timer = setTimeout(() => {
        navigate(`/email-verification?email=${encodeURIComponent(email)}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, email, navigate]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\\/?]/.test(password)
    );
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\d\-\+\(\)\s]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.userType) {
      errors.userType = 'Please select a user type';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email';
    } else if (emailExists) {
      errors.email = 'This email is already registered. Please use a different email.';
    }

    if (!passwords.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(passwords.password)) {
      errors.password = 'Password does not meet all requirements';
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwords.password !== passwords.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.contact) {
      errors.contact = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.contact)) {
      errors.contact = 'Please enter a valid phone number';
    }

    if (!formData.timezone) {
      errors.timezone = 'Timezone is required';
    }

    if (formData.userType === 3) {
      // Clinician-specific validation
      // Credential is optional
      // NPI is only required if hasNpi is checked
      if (formData.hasNpi && !formData.npiNo) {
        errors.npiNo = 'NPI number is required when NPI is selected';
      }
      // CLIA is only required if cliaCertification is checked
      if (formData.cliaCertification && !formData.cliaCertificationNo) {
        errors.cliaCertificationNo = 'CLIA certification is required when selected';
      }
      if (!formData.affiliation) {
        errors.affiliation = 'Affiliation is required';
      }
      if (!formData.referredBy) {
        errors.referredBy = 'Referred By is required';
      }
      // Sales Representative is optional
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = (): void => {
    let isValid = false;

    switch (activeStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      case 2:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1);
      setValidationErrors({});
    }
  };

  const handleBack = (): void => {
    setActiveStep((prev) => prev - 1);
    setValidationErrors({});
  };

  const handleFormChange = (field: string, value: any): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string): void => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep3()) {
      return;
    }

    const registrationData: any = {
      email: formData.email,
      password: passwords.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      contact: formData.contact,
      timezone: formData.timezone,
      userType: formData.userType as 3 | 6,
      ...(formData.userType === 3 && {
        ...(formData.credential && { credential: formData.credential }),
        ...(formData.hasNpi && { npiNo: formData.npiNo }),
        ...(formData.cliaCertification && { cliaCertificationNo: formData.cliaCertificationNo }),
        affiliation: formData.affiliation,
        referredBy: formData.referredBy,
        ...(formData.referredbyOther && { referredbyOther: formData.referredbyOther }),
        ...(formData.salesRep && { salesRep: formData.salesRep }),
      }),
    };

    dispatch(registerUser(registrationData));
  };

  const progressPercentage = ((activeStep + 1) / 4) * 100;

  return (
    <div className="account-pages py-5">
      <Container className="register-container">
        <Row className="justify-content-center">
          <Col lg="8" md="10" xs="12">
            <Card className="register-card shadow-lg">
              <CardBody className="p-4">
                {/* Header */}
                <div className="mb-4">
                  <h2 className="fw-bold text-center mb-2">Create Your Account</h2>
                  <p className="text-center text-muted mb-4">
                    Step {activeStep + 1} of 4
                  </p>

                  {/* Progress Bar */}
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progressPercentage}%` }}
                      aria-valuenow={activeStep + 1}
                      aria-valuemin={1}
                      aria-valuemax={4}
                    ></div>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert color="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Success Alert */}
                {success && (
                  <Alert color="success" className="mb-4">
                    Registration successful! Redirecting to email verification...
                  </Alert>
                )}

                {/* Step 1: User Type Selection */}
                {activeStep === 0 && (
                  <div className="step-content">
                    <h5 className="fw-bold mb-4">What type of user are you?</h5>

                    <FormGroup className="mb-3 d-none">
                      <div className="form-check">
                        <Input
                          type="radio"
                          id="patient"
                          name="userType"
                          value={6}
                          checked={formData.userType === 6}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleFormChange('userType', parseInt(e.target.value));
                            // Reset clinician-specific fields
                            handleFormChange('credential', '');
                            handleFormChange('npiNo', '');
                            handleFormChange('cliaCertificationNo', '');
                            handleFormChange('affiliation', '');
                          }}
                          className="form-check-input"
                        />
                        <Label htmlFor="patient" className="form-check-label">
                          Patient
                        </Label>
                      </div>
                    </FormGroup>

                    <FormGroup className="mb-4">
                      <div className="form-check">
                        <Input
                          type="radio"
                          id="provider"
                          name="userType"
                          value={3}
                          checked={formData.userType === 3}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleFormChange('userType', parseInt(e.target.value));
                            // Reset patient-specific fields
                            handleFormChange('referredBy', '');
                          }}
                          className="form-check-input"
                        />
                        <Label htmlFor="provider" className="form-check-label">
                          Clinician / Healthcare Provider
                        </Label>
                      </div>
                    </FormGroup>

                    {validationErrors.userType && (
                      <FormText color="danger">{validationErrors.userType}</FormText>
                    )}
                  </div>
                )}

                {/* Step 2: Account Details */}
                {activeStep === 1 && (
                  <div className="step-content">
                    <h5 className="fw-bold mb-4">Account Details</h5>

                    {/* Email */}
                    <FormGroup className="mb-3">
                      <Label for="email" className="fw-bold">
                        Email Address
                      </Label>
                      <div style={{ position: 'relative' }}>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFormChange('email', e.target.value)
                          }
                          invalid={!!validationErrors.email}
                        />
                        {emailChecking && formData.email && (
                          <small
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#667eea',
                            }}
                          >
                            Checking...
                          </small>
                        )}
                      </div>
                      {validationErrors.email && (
                        <FormText color="danger">{validationErrors.email}</FormText>
                      )}
                      {!validationErrors.email && formData.email && (
                        <>
                          {emailChecking && (
                            <FormText style={{ color: '#667eea' }}>
                              Checking email availability...
                            </FormText>
                          )}
                          {!emailChecking &&
                            validateEmail(formData.email) &&
                            emailExists && (
                              <FormText color="danger">
                                ✗ This email is already registered. Please use a different email.
                              </FormText>
                            )}
                          {!emailChecking &&
                            validateEmail(formData.email) &&
                            !emailExists && (
                              <FormText color="success">
                                ✓ Email is available
                              </FormText>
                            )}
                        </>
                      )}
                    </FormGroup>

                    {/* Password */}
                    <FormGroup className="mb-3">
                      <Label for="password" className="fw-bold">
                        Password
                      </Label>
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        value={passwords.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePasswordChange('password', e.target.value)
                        }
                        invalid={!!validationErrors.password}
                      />
                      {validationErrors.password && (
                        <FormText color="danger">{validationErrors.password}</FormText>
                      )}
                    </FormGroup>

                    {/* Password Strength Indicator */}
                    {passwords.password && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <PasswordStrengthIndicator password={passwords.password} />
                      </div>
                    )}

                    {/* Confirm Password */}
                    <FormGroup className="mb-3">
                      <Label for="confirmPassword" className="fw-bold">
                        Confirm Password
                      </Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={passwords.confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePasswordChange('confirmPassword', e.target.value)
                        }
                        invalid={!!validationErrors.confirmPassword}
                      />
                      {validationErrors.confirmPassword && (
                        <FormText color="danger">
                          {validationErrors.confirmPassword}
                        </FormText>
                      )}
                    </FormGroup>

                    {/* Terms & Conditions */}
                    <FormGroup className="mb-4">
                      <div className="form-check">
                        <Input
                          type="checkbox"
                          id="terms"
                          checked={agreeToTerms}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setAgreeToTerms(e.target.checked)
                          }
                          className="form-check-input"
                        />
                        <Label htmlFor="terms" className="form-check-label">
                          I agree to the Terms and Conditions
                        </Label>
                      </div>
                      {validationErrors.terms && (
                        <FormText color="danger">{validationErrors.terms}</FormText>
                      )}
                    </FormGroup>
                  </div>
                )}

                {/* Step 3: Personal Information */}
                {activeStep === 2 && (
                  <div className="step-content">
                    <h5 className="fw-bold mb-4">Personal Information</h5>

                    <Row>
                      {/* First Name */}
                      <Col md="6" className="mb-3">
                        <FormGroup>
                          <Label for="firstName" className="fw-bold">
                            First Name
                          </Label>
                          <Input
                            type="text"
                            name="firstName"
                            id="firstName"
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFormChange('firstName', e.target.value)
                            }
                            invalid={!!validationErrors.firstName}
                          />
                          {validationErrors.firstName && (
                            <FormText color="danger">
                              {validationErrors.firstName}
                            </FormText>
                          )}
                        </FormGroup>
                      </Col>

                      {/* Last Name */}
                      <Col md="6" className="mb-3">
                        <FormGroup>
                          <Label for="lastName" className="fw-bold">
                            Last Name
                          </Label>
                          <Input
                            type="text"
                            name="lastName"
                            id="lastName"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFormChange('lastName', e.target.value)
                            }
                            invalid={!!validationErrors.lastName}
                          />
                          {validationErrors.lastName && (
                            <FormText color="danger">
                              {validationErrors.lastName}
                            </FormText>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* Phone Number */}
                    <FormGroup className="mb-3">
                      <Label for="contact" className="fw-bold">
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        name="contact"
                        id="contact"
                        placeholder="Enter phone number"
                        value={formData.contact}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFormChange('contact', e.target.value)
                        }
                        invalid={!!validationErrors.contact}
                      />
                      {validationErrors.contact && (
                        <FormText color="danger">{validationErrors.contact}</FormText>
                      )}
                    </FormGroup>

                    {/* Timezone */}
                    <FormGroup className="mb-4">
                      <Label for="timezone" className="fw-bold">
                        Timezone
                      </Label>
                      <Input
                        type="select"
                        name="timezone"
                        id="timezone"
                        value={formData.timezone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFormChange('timezone', e.target.value)
                        }
                        invalid={!!validationErrors.timezone}
                        disabled={timezonesLoading}
                      >
                        {timezonesLoading && (
                          <option value={formData.timezone}>
                            Loading timezones...
                          </option>
                        )}
                        {!timezonesLoading && timezones.length === 0 && (
                          <option value={formData.timezone}>
                            No timezones available
                          </option>
                        )}
                        {timezones.map((tz) => (
                          <option key={tz.nameOfTimeZone} value={tz.nameOfTimeZone}>
                            {tz.nameOfTimeZone}
                          </option>
                        ))}
                      </Input>
                      {validationErrors.timezone && (
                        <FormText color="danger">{validationErrors.timezone}</FormText>
                      )}
                    </FormGroup>

                    {/* Clinician-Specific Fields */}
                    {formData.userType === 3 && (
                      <>
                        <h6 className="fw-bold mb-3 mt-3">Healthcare Provider Details</h6>

                        {/* Credential - Optional */}
                        <FormGroup className="mb-3">
                          <Label for="credential" className="fw-bold">
                            Credential <span className="text-muted">(Optional)</span>
                          </Label>
                          <Input
                            type="text"
                            name="credential"
                            id="credential"
                            placeholder="e.g., MD, DO, PA, NP"
                            value={formData.credential}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFormChange('credential', e.target.value)
                            }
                          />
                        </FormGroup>

                        {/* NPI Number - Optional with Checkbox */}
                        <FormGroup className="mb-3">
                          <div className="form-check mb-2">
                            <Input
                              type="checkbox"
                              id="hasNpi"
                              checked={formData.hasNpi}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleFormChange('hasNpi', e.target.checked)
                              }
                              className="form-check-input"
                            />
                            <Label htmlFor="hasNpi" className="form-check-label fw-bold">
                              I have an NPI Number
                            </Label>
                          </div>
                          {formData.hasNpi && (
                            <>
                              <Input
                                type="text"
                                name="npiNo"
                                id="npiNo"
                                placeholder="Enter your NPI number"
                                value={formData.npiNo}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleFormChange('npiNo', e.target.value)
                                }
                                invalid={!!validationErrors.npiNo}
                              />
                              {validationErrors.npiNo && (
                                <FormText color="danger">
                                  {validationErrors.npiNo}
                                </FormText>
                              )}
                            </>
                          )}
                        </FormGroup>

                        {/* CLIA Certification - Optional with Checkbox */}
                        <FormGroup className="mb-3">
                          <div className="form-check mb-2">
                            <Input
                              type="checkbox"
                              id="cliaCertification"
                              checked={formData.cliaCertification}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleFormChange('cliaCertification', e.target.checked)
                              }
                              className="form-check-input"
                            />
                            <Label htmlFor="cliaCertification" className="form-check-label fw-bold">
                              I have CLIA Certification
                            </Label>
                          </div>
                          {formData.cliaCertification && (
                            <>
                              <Input
                                type="text"
                                name="cliaCertificationNo"
                                id="cliaCertificationNo"
                                placeholder="Enter your CLIA certification number"
                                value={formData.cliaCertificationNo}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleFormChange('cliaCertificationNo', e.target.value)
                                }
                                invalid={!!validationErrors.cliaCertificationNo}
                              />
                              {validationErrors.cliaCertificationNo && (
                                <FormText color="danger">
                                  {validationErrors.cliaCertificationNo}
                                </FormText>
                              )}
                            </>
                          )}
                        </FormGroup>

                        {/* Affiliation - Required Dropdown */}
                        <FormGroup className="mb-3">
                          <Label className="fw-bold">Affiliation</Label>
                          <CreatableSelect
                            options={affiliations.map((aff) => ({
                              value: aff.affiliation,
                              label: aff.affiliation,
                            }))}
                            value={
                              formData.affiliation
                                ? {
                                    value: formData.affiliation,
                                    label: formData.affiliation,
                                  }
                                : null
                            }
                            onChange={(option: any) =>
                              handleFormChange(
                                'affiliation',
                                option?.value || ''
                              )
                            }
                            placeholder="Select or type affiliation..."
                            isClearable
                            isSearchable
                            className={
                              validationErrors.affiliation
                                ? 'select-error'
                                : ''
                            }
                          />
                          {validationErrors.affiliation && (
                            <FormText color="danger">
                              {validationErrors.affiliation}
                            </FormText>
                          )}
                        </FormGroup>

                        {/* Referred By - Clinician Only */}
                        {formData.userType === 3 && (
                          <>
                            <FormGroup className="mb-3">
                              <Label className="fw-bold">Referred By</Label>
                              <CreatableSelect
                                options={referredByList.map((item) => ({
                                  value: item.id,
                                  label: item.referredBy,
                                }))}
                                value={
                                  formData.referredBy
                                    ? {
                                        value: formData.referredBy,
                                        label:
                                          referredByList.find(
                                            (item) => item.id === formData.referredBy
                                          )?.referredBy || formData.referredBy,
                                      }
                                    : null
                                }
                                onChange={(option: any) =>
                                  handleFormChange(
                                    'referredBy',
                                    option?.value || ''
                                  )
                                }
                                placeholder="Select or type referred by..."
                                isClearable
                                isSearchable
                                className={
                                  validationErrors.referredBy
                                    ? 'select-error'
                                    : ''
                                }
                              />
                              {validationErrors.referredBy && (
                                <FormText color="danger">
                                  {validationErrors.referredBy}
                                </FormText>
                              )}
                            </FormGroup>

                            {/* Referred By Other - Conditional Textbox */}
                            {formData.referredBy === 8 && (
                              <FormGroup className="mb-3">
                                <Label for="referredbyOther" className="fw-bold">
                                  Please Specify <span className="text-muted">(Optional)</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="referredbyOther"
                                  id="referredbyOther"
                                  placeholder="Please specify who referred you..."
                                  value={formData.referredbyOther}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleFormChange('referredbyOther', e.target.value)
                                  }
                                />
                              </FormGroup>
                            )}

                            {/* Sales Representative - Optional Dropdown */}
                            <FormGroup className="mb-3">
                              <Label className="fw-bold">
                                Sales Representative <span className="text-muted">(Optional)</span>
                              </Label>
                              <CreatableSelect
                                options={salesRepList.map((rep) => ({
                                  value: rep.id,
                                  label: rep.salesRep,
                                }))}
                                value={
                                  formData.salesRep
                                    ? {
                                        value: formData.salesRep,
                                        label:
                                          salesRepList.find(
                                            (item) => item.id === formData.salesRep
                                          )?.salesRep || formData.salesRep,
                                      }
                                    : null
                                }
                                onChange={(option: any) =>
                                  handleFormChange(
                                    'salesRep',
                                    option?.value || ''
                                  )
                                }
                                placeholder="Select or type sales representative..."
                                isClearable
                                isSearchable
                                className={
                                  validationErrors.salesRep
                                    ? 'select-error'
                                    : ''
                                }
                              />
                              {validationErrors.salesRep && (
                                <FormText color="danger">
                                  {validationErrors.salesRep}
                                </FormText>
                              )}
                            </FormGroup>
                          </>
                        )}
                      </>
                    )}

                  </div>
                )}

                {/* Step 4: Review & Confirm */}
                {activeStep === 3 && (
                  <div className="step-content">
                    <h5 className="fw-bold mb-4">Review Your Information</h5>

                    <Card className="bg-light mb-4">
                      <CardBody>
                        <h6 className="fw-bold mb-3">Account Information</h6>
                        <Row>
                          <Col md="6">
                            <p className="text-muted mb-2">
                              <small>Email</small>
                            </p>
                            <p className="fw-bold mb-3">{formData.email}</p>
                          </Col>
                          <Col md="6">
                            <p className="text-muted mb-2">
                              <small>User Type</small>
                            </p>
                            <p className="fw-bold mb-3">
                              {formData.userType === 3
                                ? 'Clinician'
                                : 'Patient'}
                            </p>
                          </Col>
                        </Row>

                        <hr />

                        <h6 className="fw-bold mb-3">Personal Information</h6>
                        <Row>
                          <Col md="6">
                            <p className="text-muted mb-2">
                              <small>Name</small>
                            </p>
                            <p className="fw-bold mb-3">
                              {formData.firstName} {formData.lastName}
                            </p>
                          </Col>
                          <Col md="6">
                            <p className="text-muted mb-2">
                              <small>Phone</small>
                            </p>
                            <p className="fw-bold mb-3">{formData.contact}</p>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="6">
                            <p className="text-muted mb-2">
                              <small>Timezone</small>
                            </p>
                            <p className="fw-bold mb-3">{formData.timezone}</p>
                          </Col>
                        </Row>

                        {/* Clinician-Specific Review */}
                        {formData.userType === 3 && (
                          <>
                            <hr />
                            <h6 className="fw-bold mb-3">Healthcare Provider Details</h6>
                            <Row>
                              <Col md="6">
                                <p className="text-muted mb-2">
                                  <small>Affiliation</small>
                                </p>
                                <p className="fw-bold mb-3">{formData.affiliation}</p>
                              </Col>
                              {formData.credential && (
                                <Col md="6">
                                  <p className="text-muted mb-2">
                                    <small>Credential</small>
                                  </p>
                                  <p className="fw-bold mb-3">{formData.credential}</p>
                                </Col>
                              )}
                            </Row>
                            <Row>
                              <Col md="6">
                                <p className="text-muted mb-2">
                                  <small>Referred By</small>
                                </p>
                                <p className="fw-bold mb-3">
                                  {referredByList.find((item) => item.id === formData.referredBy)
                                    ?.referredBy || formData.referredBy}
                                </p>
                              </Col>
                              <Col md="6">
                                <p className="text-muted mb-2">
                                  <small>Sales Representative</small>
                                </p>
                                <p className="fw-bold mb-3">
                                  {salesRepList.find((item) => item.id === formData.salesRep)
                                    ?.salesRep || 'Not specified'}
                                </p>
                              </Col>
                            </Row>
                            {formData.referredbyOther && (
                              <Row>
                                <Col md="6">
                                  <p className="text-muted mb-2">
                                    <small>Referred By Other</small>
                                  </p>
                                  <p className="fw-bold mb-3">{formData.referredbyOther}</p>
                                </Col>
                              </Row>
                            )}
                            {formData.hasNpi && (
                              <Row>
                                <Col md="6">
                                  <p className="text-muted mb-2">
                                    <small>NPI Number</small>
                                  </p>
                                  <p className="fw-bold mb-3">{formData.npiNo}</p>
                                </Col>
                              </Row>
                            )}
                            {formData.cliaCertification && (
                              <Row>
                                <Col md="6">
                                  <p className="text-muted mb-2">
                                    <small>CLIA Certification</small>
                                  </p>
                                  <p className="fw-bold mb-3">
                                    {formData.cliaCertificationNo}
                                  </p>
                                </Col>
                              </Row>
                            )}
                          </>
                        )}

                      </CardBody>
                    </Card>

                    <Alert color="info">
                      <small>
                        Please review your information carefully before submitting. You
                        will need to verify your email address after registration.
                      </small>
                    </Alert>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <Button
                    outline
                    color="secondary"
                    onClick={handleBack}
                    disabled={activeStep === 0 || loading}
                  >
                    Back
                  </Button>

                  {activeStep < 3 ? (
                    <Button
                      color="primary"
                      onClick={handleNext}
                      disabled={loading}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      color="success"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  )}
                </div>

                {/* Login Link */}
                <p className="text-center text-muted mt-4 mb-0">
                  Already have an account?{' '}
                  <a href="/login" className="text-primary fw-bold">
                    Login here
                  </a>
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
