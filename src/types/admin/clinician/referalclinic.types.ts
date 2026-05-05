
export interface ClinicianClinicList {
    id: number;
    code: string | null;
    clinicId: number;
    clinicName: string | null;
    clinicianId: number;
    active: boolean;
    primary: boolean;
}

export interface ClinicianClinicModel {
    id: number;
    clinicId: number | null;
    clinicianId: number;
    active: boolean;
    primary: boolean;
}

