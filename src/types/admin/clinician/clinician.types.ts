
export interface UserModel {
  userId: number;
  userName: string;
  identityId: string;
  userType: number;
  active: boolean;

}    

export interface ClinicianList {
    id: number;
    code: string | null;
    profileImage: string | null;
    providerName: string | null;
    firstName: string | null;
    lastName: string | null;
    active: string | null; // API returns 'Yes'/'No'
    npiNo: string | null;
    primaryClinic: string | null;
    affiliation: string | null;
    primary_Contact: string | null;
    primary_Email: string | null;
    orderDate: string | null;
    totalOrders: number | null;
    totalAmount: string | null;
}



export interface ClinicianModel {
    id: number;
    clientId: number;
    userId: number | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    title: string | null;
    credential: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    cityId: number | null;
    stateId: number | null;
    countryId: number | null;
    zip: string | null;
    profileImage: string | null;
    active: boolean | null;
    code: string | null;
    timeZone: string | null;
    dob: string | null;
    registrationDate: string | null;
    subscriptionId: number | null;
    signature: string | null;
    upinNo: string | null;
    npiNo: string | null;
    bwoVcsign: boolean | null;
    keyword: string | null;
    sms: boolean | null;
    referredBy: number | null;
    referredbyOther: string | null;
    salesRep: number | null;
    cliaCertification: boolean | null;
    cliaCertificationNo: string | null;
    isAddedSendGrid: boolean | null;
    clinicianContact: ClinicianContact;
    clinicianRecruits: ClinicianRecruit;
    userDetail: UserModel;
}
export interface ClinicianContact {
    id: number;
    clinicianId: number;
    primaryContact: string | null;
    secondaryContact: string | null;
    primaryEmail: string | null;
    secondaryEmail: string | null;
    emergencyContact: string | null;
    emergencyPerson: string | null;
}

export interface ClinicianRecruit {
    id: number;
    clinicianId: number;
    dateOfHire: string | null;
    clinicId: number | null;
    hourlyRate: number | null;
    recruitCvid: number | null;
    payrollProcess: boolean | null;
    policyDisplay: boolean | null;
    protocolDisplay: boolean | null;
    salaryPayBy: string | null;
    bankName: string | null;
    dateOfExit: string | null;
    onlineBooking: boolean | null;
    affiliation: string | null;
    affiliationOther: string | null;
    canViewBioLabs: boolean | null;
    canViewCommission: boolean | null;
    agentId: number | null;
    diseaseList: number[] | null;
    billingProcedure: number | null;
    billingAgreementSigned: boolean | null;
    billingAgreement: string | null;
    tempCouponCode: string | null;
}

export interface BillingProcedureTypeList {
    id: number;
    billingProcedure: string;
}

export interface BillingProcedureList {
    billingProcedure: number;
    couponCode: string;
}

export interface ChangePassword {
    identityId: string;
    password: string;
}

export interface ChangeUserName {
    identityId: string;
    userName: string;
}