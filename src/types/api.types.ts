/**
 * API Request/Response Types
 * Comprehensive types for VC API integration
 */

// =====================================================
// GENERIC RESPONSE WRAPPERS
// =====================================================

export interface ApiResponse<T = any> {
  code?: number | string;
  Code?: number | string;
  success?: boolean;
  message?: string;
  data?: T;
  data_source?: string;
  state?: string;
  State?: string;
  status?: string;
  Status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  provider: string;
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
  code: string;
  method: 'totp' | 'sms' | 'email';
  rememberDevice?: boolean;
}

export interface MfaVerifyResponse {
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
