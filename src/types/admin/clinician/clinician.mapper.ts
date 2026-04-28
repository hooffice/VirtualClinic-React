import { ClinicianForm } from "./clinician.schema";
import { ClinicianModel, ClinicianContact, ClinicianRecruit, UserModel } from "./clinician.types";

//API - to - Form
export const toForm = (data: ClinicianModel): ClinicianForm => {
  return {
    id: data.id,
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

    // Nested objects - optional in form schema
    clinicianContact: data.clinicianContact ? {
      id: data.clinicianContact.id,
      clinicianId: data.clinicianContact.clinicianId,
      primaryContact: data.clinicianContact.primaryContact,
      secondaryContact: data.clinicianContact.secondaryContact,
      primaryEmail: data.clinicianContact.primaryEmail,
      secondaryEmail: data.clinicianContact.secondaryEmail,
      emergencyContact: data.clinicianContact.emergencyContact,
      emergencyPerson: data.clinicianContact.emergencyPerson,
    } : undefined,

    clinicianRecruits: data.clinicianRecruits ? {
      id: data.clinicianRecruits.id,
      clinicianId: data.clinicianRecruits.clinicianId,
      dateOfHire: data.clinicianRecruits.dateOfHire,
      clinicId: data.clinicianRecruits.clinicId,
      hourlyRate: data.clinicianRecruits.hourlyRate,
      recruitCvid: data.clinicianRecruits.recruitCvid,
      payrollProcess: data.clinicianRecruits.payrollProcess,
      policyDisplay: data.clinicianRecruits.policyDisplay,
      protocolDisplay: data.clinicianRecruits.protocolDisplay,
      salaryPayBy: data.clinicianRecruits.salaryPayBy,
      bankName: data.clinicianRecruits.bankName,
      dateOfExit: data.clinicianRecruits.dateOfExit,
      onlineBooking: data.clinicianRecruits.onlineBooking,
      affiliation: data.clinicianRecruits.affiliation,
      affiliationOther: data.clinicianRecruits.affiliationOther,
      canViewBioLabs: data.clinicianRecruits.canViewBioLabs,
      canViewCommission: data.clinicianRecruits.canViewCommission,
      agentId: data.clinicianRecruits.agentId,
      diseaseList: data.clinicianRecruits.diseaseList,
      billingProcedure: data.clinicianRecruits.billingProcedure,
      billingAgreementSigned: data.clinicianRecruits.billingAgreementSigned,
      billingAgreement: data.clinicianRecruits.billingAgreement,
      tempCouponCode: data.clinicianRecruits.tempCouponCode,
    } : undefined,

    userDetail: data.userDetail ? {
      userId: data.userDetail.userId,
      userName: data.userDetail.userName,
      userType: data.userDetail.userType,
      identityId: data.userDetail.identityId,
      active: data.userDetail.active
    } : undefined
  };
};

//Form - to - API
export const toModel = (form: ClinicianForm): ClinicianModel => {
  return {
    id: form.id,
    clientId: form.clientId,

    userId: form.userId,

    firstName: form.firstName,
    middleName: form.middleName,
    lastName: form.lastName,

    title: form.title,
    credential: form.credential,

    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2,

    cityId: form.cityId,

    stateId: form.stateId,

    countryId: form.countryId,
    zip: form.zip,

    profileImage: form.profileImage,

    active: form.active,

    code: form.code,
    timeZone: form.timeZone,

    dob: form.dob,
    registrationDate: form.registrationDate,

    subscriptionId: form.subscriptionId,

    signature: form.signature,
    upinNo: form.upinNo,
    npiNo: form.npiNo,

    bwoVcsign: form.bwoVcsign,
    keyword: form.keyword,

    sms: form.sms,

    referredBy: form.referredBy,
    referredbyOther: form.referredbyOther,

    salesRep: form.salesRep,

    cliaCertification: form.cliaCertification,
    cliaCertificationNo: form.cliaCertificationNo,

    isAddedSendGrid: form.isAddedSendGrid,

    clinicianContact: form.clinicianContact as ClinicianContact,
    clinicianRecruits: form.clinicianRecruits as ClinicianRecruit,

    userDetail: form.userDetail as UserModel,
  };
};
