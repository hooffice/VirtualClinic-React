/**
 * Error Types and Utilities
 * Structured error handling for API calls
 */

import axios from 'axios';

// =====================================================
// ERROR TYPES
// =====================================================

export interface ApiErrorData {
  code?: string | number;
  message?: string;
  details?: Record<string, any>;
  errors?: Array<{ field?: string; message: string }>;
  [key: string]: any;
}

export interface ApiErrorResponse {
  status: number;
  statusText: string;
  data?: ApiErrorData;
  message: string;
  code?: string;
  retryable: boolean;
  timestamp: string;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: ApiErrorData;
  public code?: string;
  public retryable: boolean;
  public originalError?: any;

  constructor(
    message: string,
    status: number = 500,
    statusText: string = 'Internal Server Error',
    data?: ApiErrorData,
    originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.originalError = originalError;
    this.code = data?.code as string;
    this.retryable = this.isRetryable(status);

    // Maintain prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  private isRetryable(status: number): boolean {
    // Retry on network errors, 408, 429, 5xx (except 501)
    return status >= 500 || status === 408 || status === 429 || status === 0;
  }

  toJSON(): ApiErrorResponse {
    return {
      status: this.status,
      statusText: this.statusText,
      data: this.data,
      message: this.message,
      code: this.code,
      retryable: this.retryable,
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================
// ERROR CONVERSION UTILITIES
// =====================================================

export const axiosErrorToApiError = (error: any): ApiError => {
  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const statusText = error.response?.statusText || 'Unknown Error';
    const data = error.response?.data as ApiErrorData | undefined;

    const message = data?.message || extractErrorMessage(data) || error.message || statusText;

    return new ApiError(message, status, statusText, data, error);
  }

  // Handle standard errors
  if (error instanceof Error) {
    return new ApiError(error.message, 500, 'Internal Server Error');
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new ApiError(error, 500, 'Internal Server Error');
  }

  // Fallback
  return new ApiError('An unknown error occurred', 500, 'Internal Server Error');
};

export const extractErrorMessage = (data: any): string | null => {
  if (!data) return null;

  // Try common error message fields
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.msg === 'string') return data.msg;

  // Try error arrays
  if (Array.isArray(data.errors)) {
    const firstError = data.errors[0];
    if (typeof firstError === 'string') return firstError;
    if (typeof firstError?.message === 'string') return firstError.message;
  }

  // Try validation errors
  if (data.details && typeof data.details === 'object') {
    for (const key in data.details) {
      const value = data.details[key];
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && value[0]) return String(value[0]);
    }
  }

  return null;
};

// =====================================================
// ERROR PREDICATES
// =====================================================

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (error: any): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response && error.code !== 'ECONNABORTED';
  }
  return false;
};

export const isTimeoutError = (error: any): boolean => {
  if (axios.isAxiosError(error)) {
    return error.code === 'ECONNABORTED';
  }
  return false;
};

export const is401Error = (error: any): boolean => {
  return error?.status === 401 || error?.response?.status === 401;
};

export const is403Error = (error: any): boolean => {
  return error?.status === 403 || error?.response?.status === 403;
};

export const is404Error = (error: any): boolean => {
  return error?.status === 404 || error?.response?.status === 404;
};

export const isValidationError = (error: any): boolean => {
  return error?.status === 422 || error?.response?.status === 422;
};

export const isServerError = (error: any): boolean => {
  const status = error?.status || error?.response?.status;
  return status >= 500 && status < 600;
};

// =====================================================
// ERROR MESSAGES
// =====================================================

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined;
    const extracted = extractErrorMessage(data);
    if (extracted) return extracted;
    return error.message || 'An unknown error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error) || 'An unknown error occurred';
};
