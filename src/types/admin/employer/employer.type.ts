export interface EmployerModel {
    id: number;
    clientId: number | null;
    organizationId: number | null;
    code: string | null;
    name: string | null;
    active: boolean | null;
}

export interface EmployerList {
    clientId: number | null;
    code: string | null;
    id: number;
    name: string | null;
    organizationId: number;
    active: string | null;
    companyname: string | null;
    organization: string | null;
}

export interface EmployerListResponse {
  data: EmployerList[] ;
  success: boolean;
}

export interface EmployerResponse {
  data: EmployerModel;
  success: boolean;
}

