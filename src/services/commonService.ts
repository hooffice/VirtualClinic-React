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

//Response
interface CountryResponse        { data: Country[]; success: boolean; message: string; }
interface StateResponse          { data: State[];   success: boolean; message: string; }
interface CityResponse           { data: City[];    success: boolean; message: string; }
interface DiseaseListResponse    { data: DiseaseList[];    success: boolean; message: string; }
interface UserTypeResponse       { data: UserType[]; success: boolean; message: string; }

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
}

export const commonService = new CommonService();
export default commonService;