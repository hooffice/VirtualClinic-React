/**
 * Error Serializer
 * Converts errors to plain objects for Redux storage
 * Needed because Error objects don't serialize well in Redux
 */

export const serializeError = (error: any): Record<string, any> => {
  // Handle ApiError objects
  if (error?.name === 'ApiError' || error?.toJSON) {
    return {
      name: error.name || 'ApiError',
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      code: error.code,
      retryable: error.retryable,
    };
  }

  // Handle Axios errors
  if (error?.response) {
    return {
      name: 'AxiosError',
      message: error.message,
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
    };
  }

  // Handle object errors
  if (typeof error === 'object' && error !== null) {
    return {
      ...error,
      message: error.message || 'Unknown error',
    };
  }

  // Fallback
  return {
    name: 'Error',
    message: 'An unknown error occurred',
  };
};

export const deserializeError = (serialized: any): Error => {
  const error = new Error(serialized?.message || 'Unknown error');
  error.name = serialized?.name || 'Error';
  return error;
};
