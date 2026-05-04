import { ClinicianForm } from "./clinician.schema";
import { ClinicianModel, ClinicianContact, ClinicianRecruit, UserModel } from "./clinician.types";

//emptyForm
export const emptyForm = (clientId: number): ClinicianForm => {
  return {
    id:  0,
    clientId: clientId,

    userId: null,

    firstName: "",
    middleName: "",
    lastName:  "",

    title: "",
    credential: "",

    addressLine1: "",
    addressLine2: "",

    cityId: null,

    stateId: null,

    countryId: 231,
    zip: "",

    profileImage: "",

    active: true,

    code: "",
    timeZone: "(GMT-05:00) Eastern Time (US and Canada)",

    dob: "",
    registrationDate: "",

    subscriptionId: null,

    signature: "",
    upinNo: "",
    npiNo: "",

    bwoVcsign: false,
    keyword: "",

    sms: false,

    referredBy: null,
    referredbyOther: "",

    salesRep: null,

    cliaCertification: false,
    cliaCertificationNo: "",

    isAddedSendGrid: false,
    diseaseList: [],
    // Nested objects - optional in form schema
    clinicianContact: {
      id: 0,
      clinicianId: 0,
      primaryContact: null,
      secondaryContact: null,
      primaryEmail: null,
      secondaryEmail: null,
      emergencyContact: null,
      emergencyPerson: null,
    },

    clinicianRecruits: {
      id: 0,
      clinicianId: 0,
      dateOfHire: "",
      clinicId: 16,
      hourlyRate: 0,
      recruitCvid: null,
      payrollProcess: false,
      policyDisplay: false,
      protocolDisplay: false,
      salaryPayBy: "",
      bankName: "",
      dateOfExit: "",
      onlineBooking: false,
      affiliation: "",
      affiliationOther: "",
      canViewBioLabs: false,
      canViewCommission: false,
      agentId: null,
      billingProcedure: 0,
      billingAgreementSigned: false,
      billingAgreement: "",
      tempCouponCode: "",
    },

    userDetail: {
      userId: 0,
      userName: "",
      pin: "",
      menu: "",
      userType: 3,
      identityId: "",
      active: true
    } 
  };
}

//API - to - Form
export const toForm = (data: ClinicianModel): ClinicianForm => {
  return {
    id: data.id ?? 0,
    clientId: data.clientId,

    userId: data.userId ?? null,

    firstName: data.firstName ?? "",
    middleName: data.middleName ?? "",
    lastName: data.lastName ?? "",

    title: data.title ?? "",
    credential: data.credential ?? "",

    addressLine1: data.addressLine1 ?? "",
    addressLine2: data.addressLine2 ?? "",

    cityId: data.cityId ?? null,

    stateId: data.stateId ?? null,

    countryId: data.countryId ?? 231,
    zip: data.zip ?? "",

    profileImage: data.profileImage ?? "",

    active: data.active ? true : false,

    code: data.code ?? "",
    timeZone: data.timeZone ?? "",

    dob: data.dob ?? "",
    registrationDate: data.registrationDate ?? "",

    subscriptionId: data.subscriptionId ?? null,

    signature: data.signature ?? "",
    upinNo: data.upinNo ?? "",
    npiNo: data.npiNo ?? "",

    bwoVcsign: data.bwoVcsign ?? false,
    keyword: data.keyword ?? "",

    sms: data.sms ?? false,

    referredBy: data.referredBy ?? null,
    referredbyOther: data.referredbyOther ?? "",

    salesRep: data.salesRep ?? null,

    cliaCertification: data.cliaCertification ?? false,
    cliaCertificationNo: data.cliaCertificationNo ?? "",

    isAddedSendGrid: data.isAddedSendGrid ?? false,
    diseaseList: Array.isArray(data.diseaseList) && data.diseaseList.length > 0 ? data.diseaseList : null,
    // Nested objects - optional in form schema
    clinicianContact: data.clinicianContact ? {
      id: data.clinicianContact.id,
      clinicianId: data.clinicianContact.clinicianId,
      primaryContact: data.clinicianContact.primaryContact?.trim() || null,
      secondaryContact: data.clinicianContact.secondaryContact?.trim() || null,
      primaryEmail: data.clinicianContact.primaryEmail?.trim() || null,
      secondaryEmail: data.clinicianContact.secondaryEmail?.trim() || null,
      emergencyContact: data.clinicianContact.emergencyContact?.trim() || null,
      emergencyPerson: data.clinicianContact.emergencyPerson?.trim() || null,
    } : undefined,

    clinicianRecruits: data.clinicianRecruits ? {
      id: data.clinicianRecruits.id,
      clinicianId: data.clinicianRecruits.clinicianId,
      dateOfHire: data.clinicianRecruits.dateOfHire || null,
      clinicId: data.clinicianRecruits.clinicId,
      hourlyRate: data.clinicianRecruits.hourlyRate || null,
      recruitCvid: data.clinicianRecruits.recruitCvid || null,
      payrollProcess: data.clinicianRecruits.payrollProcess || false,
      policyDisplay: data.clinicianRecruits.policyDisplay || false,
      protocolDisplay: data.clinicianRecruits.protocolDisplay || false,
      salaryPayBy: data.clinicianRecruits.salaryPayBy || null,
      bankName: data.clinicianRecruits.bankName || null,
      dateOfExit: data.clinicianRecruits.dateOfExit || null,
      onlineBooking: data.clinicianRecruits.onlineBooking || null,
      affiliation: data.clinicianRecruits.affiliation || null,
      affiliationOther: data.clinicianRecruits.affiliationOther || null,
      canViewBioLabs: data.clinicianRecruits.canViewBioLabs || false,
      canViewCommission: data.clinicianRecruits.canViewCommission || false,
      agentId: data.clinicianRecruits.agentId || null,
      billingProcedure: data.clinicianRecruits.billingProcedure || 0,
      billingAgreementSigned: data.clinicianRecruits.billingAgreementSigned || false,
      billingAgreement: data.clinicianRecruits.billingAgreement || null,
      tempCouponCode: data.clinicianRecruits.tempCouponCode || null,
    } : undefined,

    userDetail: data.userDetail ? {
      userId: data.userDetail.userId,
      userName: data.userDetail.userName,
      userType: data.userDetail.userType ?? null,
      pin: data.userDetail.pin,
      menu: data.userDetail.menu,
      identityId: data.userDetail.identityId,
      active: data.userDetail.active
    } : undefined
  };
};

//Form - to - API
export const toModel = (form: ClinicianForm): ClinicianModel => {
  // Helper function to convert empty strings to null
  const emptyToNull = (value: any) =>
    typeof value === "string" && value.trim() === "" ? null : value;

  return {
    id: form.id,
    clientId: form.clientId,

    userId: form.userId,

    firstName: form.firstName || "",
    middleName: emptyToNull(form.middleName),
    lastName: form.lastName || "",

    title: emptyToNull(form.title),
    credential: emptyToNull(form.credential),

    addressLine1: emptyToNull(form.addressLine1),
    addressLine2: emptyToNull(form.addressLine2),

    cityId: form.cityId,

    stateId: form.stateId,

    countryId: form.countryId,
    zip: emptyToNull(form.zip),

    profileImage: emptyToNull(form.profileImage),

    active: form.active,

    code: emptyToNull(form.code),
    timeZone: form.timeZone,

    dob: emptyToNull(form.dob),
    registrationDate: emptyToNull(form.registrationDate),

    subscriptionId: form.subscriptionId,

    signature: emptyToNull(form.signature),
    upinNo: emptyToNull(form.upinNo),
    npiNo: emptyToNull(form.npiNo),

    bwoVcsign: form.bwoVcsign,
    keyword: emptyToNull(form.keyword),

    sms: form.sms,

    referredBy: form.referredBy,
    referredbyOther: emptyToNull(form.referredbyOther),

    salesRep: form.salesRep,

    cliaCertification: form.cliaCertification,
    cliaCertificationNo: emptyToNull(form.cliaCertificationNo),

    isAddedSendGrid: form.isAddedSendGrid,
    diseaseList: Array.isArray(form.diseaseList) && form.diseaseList.length > 0 ? form.diseaseList : null,

    clinicianContact: form.clinicianContact ? {
      ...form.clinicianContact,
      primaryContact: emptyToNull(form.clinicianContact.primaryContact),
      secondaryContact: emptyToNull(form.clinicianContact.secondaryContact),
      primaryEmail: emptyToNull(form.clinicianContact.primaryEmail),
      secondaryEmail: emptyToNull(form.clinicianContact.secondaryEmail),
      emergencyContact: emptyToNull(form.clinicianContact.emergencyContact),
      emergencyPerson: emptyToNull(form.clinicianContact.emergencyPerson),
    } as ClinicianContact : null as any,

    clinicianRecruits: form.clinicianRecruits ? {
      ...form.clinicianRecruits,
      dateOfHire: emptyToNull(form.clinicianRecruits.dateOfHire),
      salaryPayBy: emptyToNull(form.clinicianRecruits.salaryPayBy),
      bankName: emptyToNull(form.clinicianRecruits.bankName),
      dateOfExit: emptyToNull(form.clinicianRecruits.dateOfExit),
      affiliation: emptyToNull(form.clinicianRecruits.affiliation),
      affiliationOther: emptyToNull(form.clinicianRecruits.affiliationOther),
      billingAgreement: emptyToNull(form.clinicianRecruits.billingAgreement),
      tempCouponCode: emptyToNull(form.clinicianRecruits.tempCouponCode),
      
    } as ClinicianRecruit : null as any,

    userDetail: form.userDetail ? {
      ...form.userDetail,
      userId: form.userDetail.userId ?? null,
      userName: emptyToNull(form.userDetail.userName),
      identityId: emptyToNull(form.userDetail.identityId),
      userType: form.userDetail.userType,
      active: form.userDetail.active,
    } as UserModel : null as any,
  };
};
