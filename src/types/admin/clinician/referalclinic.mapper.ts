import { ClinicianClinicForm } from "./referalclinic.schema";
import { ClinicianClinicModel } from "./referalclinic.types";

//emptyForm
export const emptyForm = (clinicianId: number): ClinicianClinicForm => {
    return {
        id: 0,
        clinicId: null,
        clinicianId: clinicianId,
        active: true,
        primary:false
    }
}

//API - to - Form
export const toForm = (data: ClinicianClinicModel) : ClinicianClinicForm => {
    return {
        id: data.id ?? 0,
        clinicId: data.clinicId,
        clinicianId: data.clinicianId,
        active: data.active,
        primary:data.primary
    }
}

//Form - to - API
export const toModel = (form: ClinicianClinicForm) : ClinicianClinicModel => {
        return {
        id: form.id ?? 0,
        clinicId: form.clinicId,
        clinicianId: form.clinicianId,
        active: form.active,
        primary:form.primary
    }
}