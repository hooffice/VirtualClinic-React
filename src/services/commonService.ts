import axiosInstance from '@/config/axiosInstance';
import { axiosErrorToApiError } from '@/types/errors';

//Interfaces

export interface Country {
  id:          number;
  name:        string;
  countryCode: string;
}

export interface State {
  id:        number;
  name:      string;
  code:      string;
  countryID: number;
}

export interface City {
  id:      number;
  name:    string;
  stateID: number;
}

export interface DiseaseList {
    id: number;
    name: string | null;
    gauge: string | null;
    printGauge: boolean | null;
    parentID: number | null;
    hasChild: boolean | null;
}

export interface UserType {
    id: number;
    type: string;
}

export interface FileUpload {
  fileName: string;
  path: string;
}

export interface FileUploadOptions {
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[]; // MIME types, default: common image types
  onProgress?: (progress: number) => void; // Progress percentage (0-100)
}

//Response
interface CountryResponse        { data: Country[]; success: boolean; message: string; }
interface StateResponse          { data: State[];   success: boolean; message: string; }
interface CityResponse           { data: City[];    success: boolean; message: string; }
interface DiseaseListResponse    { data: DiseaseList[];    success: boolean; message: string; }
interface UserTypeResponse       { data: UserType[]; success: boolean; message: string; }
interface UploadResponse         { data: FileUpload; success: boolean; message: string; }

//Service

class CommonService {

  async getCountries(): Promise<Country[]> {
    try {
      const response = await axiosInstance.get<CountryResponse>('/api/common/country');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch countries');
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  async getStates(countryId: number): Promise<State[]> {
    try {
      const response = await axiosInstance.get<StateResponse>(`/api/common/states/${countryId}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch states');
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  async getCities(stateId: number): Promise<City[]> {
    try {
      const response = await axiosInstance.get<CityResponse>(`/api/common/cities/${stateId}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch cities');
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  async getDiseaseList(): Promise<DiseaseList[]> {
    try {
      const response = await axiosInstance.get<DiseaseListResponse>(`/api/common/diseaseslist`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch cities');
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  async getUserType(): Promise<UserType[]> {
    try {
      const response = await axiosInstance.get<UserTypeResponse>(`/api/common/usertypelist`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch cities');
    } catch (error) {
      throw axiosErrorToApiError(error);
    }
  }

  /**
   * Upload a file to the server
   * @param file - The file to upload
   * @param folder - The destination folder on the server
   * @param options - Upload options (max size, allowed types, progress callback)
   * @returns FileUpload object with fileName and path
   * @throws Error if validation fails or upload fails
   */
  async uploadFile(
    file: File,
    folder: string,
    options?: FileUploadOptions
  ): Promise<FileUpload> {
    try {
      // Validate file
      this.validateFile(file, options);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('FolderName', folder);

      // Upload with progress tracking
      const response = await axiosInstance.post<UploadResponse>(
        '/api/upload/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: any) => {
            if (options?.onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              options.onProgress(percentCompleted);
            }
          },
        }
      );

      // Validate response
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'File upload failed on server'
        );
      }

      if (!response.data.data) {
        throw new Error('No file path returned from server');
      }

      return response.data.data;
    } catch (error) {
      throw this.handleUploadError(error);
    }
  }

  /**
   * Validate file before upload
   * @throws Error if validation fails
   */
  private validateFile(file: File, options?: FileUploadOptions): void {
    // Check if file exists
    if (!file) {
      throw new Error('No file provided');
    }

    // Default options
    const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new Error(
        `File size exceeds limit. Maximum allowed size is ${maxSizeMB}MB`
      );
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    // Validate file name
    if (!file.name || file.name.trim().length === 0) {
      throw new Error('Invalid file name');
    }
  }

  /**
   * Handle upload errors with detailed messages
   */
  private handleUploadError(error: any): Error {
    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 400) {
        return new Error(message || 'Invalid file format or folder');
      } else if (status === 413) {
        return new Error('File is too large');
      } else if (status === 415) {
        return new Error('File type is not supported');
      } else if (status === 500) {
        return new Error('Server error during file upload');
      }

      return new Error(message || `Upload failed with status ${status}`);
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      return new Error('Network error. Please check your connection');
    }

    // Handle validation errors
    if (error instanceof Error) {
      return error;
    }

    // Fallback error
    return new Error('An unexpected error occurred during file upload');
  }  
}

export const commonService = new CommonService();
export default commonService;