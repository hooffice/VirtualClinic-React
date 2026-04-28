import { ClinicianModel, Clinician_Contact, Clinician_RecruitModel, UserModel } from "./clinician.type";

//API - to - Form
export const toForm = (data: ClinicianModel) => {
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

    countryId: data.countryId ?? null,
    zip: data.zip ?? "",

    profileImage: data.profileImage ?? "",

    active: data.active ?? false,

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

    // Nested objects
    clinicianContact: {
      id: data.clinicianContact?.id ?? 0,
      clinicianId: data.id,
      primaryContact: data.clinicianContact?.primaryContact ?? "",
      secondaryContact: data.clinicianContact?.secondaryContact ?? "",
      primaryEmail: data.clinicianContact?.primaryEmail ?? "",
      secondaryEmail: data.clinicianContact?.secondaryEmail ?? "",
      emergencyContact: data.clinicianContact?.emergencyContact ?? "",
      emergencyPerson: data.clinicianContact?.emergencyPerson ?? "",
    } as Clinician_Contact,

    clinicianRecruits: {
      id: data.clinicianRecruits?.id ?? 0,
      clinicianId: data.id,
      dateOfHire: data.clinicianRecruits?.dateOfHire ?? "",
      clinicId: data.clinicianRecruits?.clinicId ?? null,
      hourlyRate: data.clinicianRecruits?.hourlyRate ?? null,
      recruitCvid: data.clinicianRecruits?.recruitCvid ?? null,
      payrollProcess: data.clinicianRecruits?.payrollProcess ?? false,
      policyDisplay: data.clinicianRecruits?.policyDisplay ?? false,
      protocolDisplay: data.clinicianRecruits?.protocolDisplay ?? false,
      salaryPayBy: data.clinicianRecruits?.salaryPayBy ?? "",
      bankName: data.clinicianRecruits?.bankName ?? "",
      dateOfExit: data.clinicianRecruits?.dateOfExit ?? "",
      onlineBooking: data.clinicianRecruits?.onlineBooking ?? false,
      affiliation: data.clinicianRecruits?.affiliation ?? "",
      affiliationOther: data.clinicianRecruits?.affiliationOther ?? "",
      canViewBioLabs: data.clinicianRecruits?.canViewBioLabs ?? false,
      canViewCommission: data.clinicianRecruits?.canViewCommission ?? false,
      agentId: data.clinicianRecruits?.agentId ?? null,
      diseaseList: data.clinicianRecruits?.diseaseList ?? [],
      billingProcedure: data.clinicianRecruits?.billingProcedure ?? null,
      billingAgreementSigned: data.clinicianRecruits?.billingAgreementSigned ?? false,
      billingAgreement: data.clinicianRecruits?.billingAgreement ?? "",
      tempCouponCode: data.clinicianRecruits?.tempCouponCode ?? "",
    } as Clinician_RecruitModel,
    userDetail: {
        userId: data.userDetail.userId,
        userName: data.userDetail.userName,
        userType: data.userDetail.userType,
        identityId: data.userDetail.identityId,
        active: data.userDetail.active
    } as UserModel
  };
};

//Form - to - API
export const toModel = (form: any): ClinicianModel => {
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

    clinicianContact: form.clinicianContact,
    clinicianRecruits: form.clinicianRecruits,

    userDetail: form.userDetail ?? null,
  };
};