/**
 * Clinic Types/Interfaces
 */

export interface ClinicModel {
    id: number;
    clientId: number;
    organizationId: number;
    code: string | null;
    name: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    cityId: number | null;
    cityName: string | null;
    stateId: number | null;
    stateName: string | null;
    countryId: number | null;
    countryName: string | null;
    zip: string | null;
    contact1: string | null;
    contact2: string | null;
    active: boolean | null;
    timezone: string | null;
}


export interface ClinicListItem {
    id: number;
    name: string | null;
    code: string | null;
    address_Line1: string | null;
    address_Line2: string | null;
    city_Id: number | null;
    client_Id: number | null;
    contact1: string | null;
    contact2: string | null;
    country_Id: number | null;
    organization_Id: number | null;
    state_Id: number | null;
    zip: string | null;
    companyName: string | null;
    stateName: string | null;
    cityName: string | null;
    countryName: string | null;
    organizationName: string | null;
    active: string | null; // API returns 'Yes'/'No'
    timezone: string | null;
}


export interface ReferralClinic {
  id: number;
  name?: string | null;
}


export interface ReferralClinician {
    clinicianID: number;
    clinicianName: string | null;
    firstName: string | null;
    primary_Contact: string | null;
    primary_Email: string | null;
    lastName: string | null;
    code: string | null;
    clinicID: number;
    primary: string | null;
}


export interface ClinicPageResponse {
  data: ClinicListItem[];
  xpage: {
    currentPage: number;
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
  success: boolean;
}

export interface ClinicListResponse {
  data: ClinicListItem[];
  success: boolean;
}

export interface ClinicResponse {
  data: ClinicModel;
  success: boolean;
}

