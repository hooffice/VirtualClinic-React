/**
 * API Request/Response Types
 * Comprehensive types for VC API integration
 */

// =====================================================
// GENERIC RESPONSE WRAPPERS
// =====================================================

// export interface ApiResponse<T = any> {
//   code?: number | string;
//   Code?: number | string;
//   success?: boolean;
//   message?: string;
//   data?: T;
//   data_source?: string;
//   state?: string;
//   State?: string;
//   status?: string;
//   Status?: string;
// }

// export interface PaginatedResponse<T> {
//   items: T[];
//   totalCount: number;
//   pageNumber: number;
//   pageSize: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// }

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  message?: string;
}
// =====================================================
// SAVE RESONSE
// =====================================================

export interface SaveResponse {
  message: string;
  success: boolean;
}
// =====================================================
// AUTHENTICATION TYPES
// =====================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 3 | 6;  // 3=Clinician, 6=Patient
  timezone?: string;
  contact: string;  // Phone number

  // Patient specific fields
  clinicianID?: number;
  referredBy?: string;
  referredbyOther?: string;

  // Clinician specific fields
  credential?: string;
  npiNo?: string;
  cliacertification?: boolean;
  cliacertificationNo?: string;
  salesRep?: string;
  affiliation?: string;
  affiliationOther?: string;
}

export interface RegistrationResponse {
  message: string;
  userId: string;
  success?: boolean;
}

export interface AuthResponse {
  code?: string | number;
  Code?: string | number;
  success?: boolean;
  message?: string;
  accessToken?: string;
  AccessToken?: string;
  refreshToken?: string;
  RefreshToken?: string;
  user?: UserDto;
  User?: UserDto;
  userId?: string;
  UserId?: string;
  status?: string;
  Status?: string;
  state?: string;
  State?: string;
  [key: string]: any;
}

export interface RefreshTokenResponse {
  accessToken: string;
  AccessToken: string;
  expiresIn?: number;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  provider: string;
  trustedDevice: boolean;
}

// =====================================================
// USER TYPES
// =====================================================

export interface UserDto {
  id?: string;
  userId?: string;
  email?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UserTimezoneModel {
  timezone: string;
}

// =====================================================
// PASSWORD TYPES
// =====================================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

// =====================================================
// MFA TYPES
// =====================================================

export interface MfaSetupRequest {
  method: 'totp' | 'sms' | 'email';
  phone?: string;
}

export interface MfaSetupResponse {
  qrCode?: string;
  secret?: string;
  backupCodes?: string[];
  message: string;
}

export interface MfaVerifyRequest {
  userId: string;
  token: string;  // 6-digit code from authenticator
  method?: 'totp' | 'sms' | 'email';
  TrustDevice?: boolean;  // Trust this device for future logins (PascalCase for backend)
  TrustDays?: number;     // How many days to trust (default: 30) (PascalCase for backend)
}

export interface MfaVerifyResponse {
  //
  code?: string;
  Code?: string;
  status?: string;
  Status?: string;
  state?: string;
  State?: string;
  userId?: string;
  UserId?: string;
  //
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: UserDto;
}

// =====================================================
// API CLIENT FILE OPERATIONS
// =====================================================

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadOptions {
  onProgress?: (progress: FileUploadProgress) => void;
  timeout?: number;
}

export interface BatchRequest {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  url: string;
  data?: any;
  params?: Record<string, any>;
}

export interface BatchResponse<T = any> {
  status: number;
  data: T;
  error?: string;
}

// =====================================================
// COMMON QUERY PARAMETERS
// =====================================================

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams, SortParams {
  search?: string;
  filter?: Record<string, any>;
}


// =====================================================
//SELECT OPTION NUMER VALUE
// =====================================================
export interface SelectOption { value: number; label: string };
// =====================================================
//SELECT OPTION STRING VALUE
// =====================================================
export interface SelectStringOption { value: string; label: string };