/**
 * Typed API Client Service
 * - Generic type support for all HTTP methods
 * - File upload/download support
 * - Request/response transformation
 * - Batch request support
 * - Comprehensive error handling
 */

import axiosInstance from '@/config/axiosInstance';
import {
  FileUploadOptions,
  BatchRequest,
  BatchResponse,
} from '@/types/api.types';
import { ApiError, axiosErrorToApiError } from '@/types/errors';

export class ApiClient {
  /**
   * GET request with generic type support
   */
  async get<T = any>(
    url: string,
    config?: any
  ): Promise<T> {
    try {
      console.log('[ApiClient] GET', url);
      const response = await axiosInstance.get(url, config);
      return this.extractData<T>(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request with generic type support
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      console.log('[ApiClient] POST', url);
      const response = await axiosInstance.post(url, data, config);
      return this.extractData<T>(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request with generic type support
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      console.log('[ApiClient] PUT', url);
      const response = await axiosInstance.put(url, data, config);
      return this.extractData<T>(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request with generic type support
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      console.log('[ApiClient] PATCH', url);
      const response = await axiosInstance.patch(url, data, config);
      return this.extractData<T>(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request with generic type support
   */
  async delete<T = any>(
    url: string,
    config?: any
  ): Promise<T> {
    try {
      console.log('[ApiClient] DELETE', url);
      const response = await axiosInstance.delete(url, config);
      return this.extractData<T>(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * File upload with progress tracking
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    options?: FileUploadOptions
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('[ApiClient] UPLOAD', url, file.name);

      const response = await axiosInstance.post(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: options?.timeout || 60000,
          onUploadProgress: (event: any) => {
            if (options?.onProgress && event.total) {
              options.onProgress({
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100),
              });
            }
          },
        }
      );

      return this.extractData<T>(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Multiple file upload with progress tracking
   */
  async uploadFiles<T = any>(
    url: string,
    files: File[],
    fieldName: string = 'files',
    options?: FileUploadOptions
  ): Promise<T> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(fieldName, file);
      });

      console.log('[ApiClient] UPLOAD MULTIPLE', url, `${files.length} files`);

      const response = await axiosInstance.post(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: options?.timeout || 60000,
          onUploadProgress: (event: any) => {
            if (options?.onProgress && event.total) {
              options.onProgress({
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100),
              });
            }
          },
        }
      );

      return this.extractData<T>(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download file with blob support
   */
  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      console.log('[ApiClient] DOWNLOAD', url);

      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });

      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Batch requests - execute multiple requests in parallel
   */
  async batch<T extends BatchRequest>(
    requests: T[]
  ): Promise<BatchResponse[]> {
    try {
      console.log('[ApiClient] BATCH', `${requests.length} requests`);

      const promises = requests.map((req) => this.executeBatchRequest(req));
      return await Promise.allSettled(promises).then((results) =>
        results.map((result) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              status: 500,
              data: null,
              error: result.reason?.message || 'Request failed',
            };
          }
        })
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Execute a single batch request
   */
  private async executeBatchRequest(req: BatchRequest): Promise<BatchResponse> {
    try {
      let response;

      switch (req.method) {
        case 'get':
          response = await axiosInstance.get(req.url, { params: req.params });
          break;
        case 'post':
          response = await axiosInstance.post(req.url, req.data);
          break;
        case 'put':
          response = await axiosInstance.put(req.url, req.data);
          break;
        case 'patch':
          response = await axiosInstance.patch(req.url, req.data);
          break;
        case 'delete':
          response = await axiosInstance.delete(req.url);
          break;
        default:
          throw new Error(`Unsupported method: ${req.method}`);
      }

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      return {
        status: error.response?.status || 500,
        data: null,
        error: error.message,
      };
    }
  }

  /**
   * Extract data from API response, handling different response shapes
   */
  private extractData<T>(response: any): T {
    // If response has a 'data' property, return it
    if (response?.data !== undefined) {
      return response.data as T;
    }

    // If response itself is the data, return it
    return response as T;
  }

  /**
   * Handle errors and convert to ApiError
   */
  private handleError(error: any): ApiError {
    console.error('[ApiClient] Error:', error);
    return axiosErrorToApiError(error);
  }
}

/**
 * Export singleton instance
 */
export const apiClient = new ApiClient();
export default apiClient;
