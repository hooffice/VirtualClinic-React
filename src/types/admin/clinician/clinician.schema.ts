import { z } from "zod";

export const userModelSchema = z.object({
    userId: z.number().int().nullable(),
    userName: z.union([
      z.literal(null),
      z.string().min(1, "UserName is required")
    ]).nullable(),
    pin: z.string().nullable(),
    menu: z.string().nullable(),
    identityId: z.string().nullable(),
    userType: z.number().int().nullable(),
    active: z.boolean().nullable(),
});

export const clinicianContactSchema = z.object({
  id: z.number(),
  clinicianId: z.number(),

  primaryContact: z.string().nullable().refine(
    (val) => val === null || (val.trim().length > 0),
    { message: "Primary Contact is required" }
  ),
  secondaryContact: z.string().nullable(),

  primaryEmail: z.union([
    z.literal(null),
    z.string().email("Invalid email format")
  ]).refine(
    (val) => val === null || (val.trim().length > 0),
    { message: "Primary Email is required" }
  ),
  secondaryEmail: z.string().email().nullable(),

  emergencyContact: z.string().nullable(),
  emergencyPerson: z.string().nullable(),
});

export const clinicianRecruitSchema = z.object({
  id: z.number(),
  clinicianId: z.number(),

  dateOfHire: z.string().nullable(),
  clinicId: z.number().nullable(),

  hourlyRate: z.number().nullable(),
  recruitCvid: z.number().nullable(),

  payrollProcess: z.boolean().nullable(),
  policyDisplay: z.boolean().nullable(),
  protocolDisplay: z.boolean().nullable(),

  salaryPayBy: z.string().nullable(),
  bankName: z.string().nullable(),

  dateOfExit: z.string().nullable(),

  onlineBooking: z.boolean().nullable(),
  affiliation: z.string().nullable(),
  affiliationOther: z.string().nullable(),

  canViewBioLabs: z.boolean().nullable(),
  canViewCommission: z.boolean().nullable(),

  agentId: z.number().nullable(),

  billingProcedure: z.number().nullable().refine((val) => val !== null, {
    message: "Billing Type is required",
  }),
  billingAgreementSigned: z.boolean().nullable(),
  billingAgreement: z.string().nullable(),

  tempCouponCode: z.string().nullable(),
});

export const clinicianSchema = z.object({
  id: z.number(),
  clientId: z.number(),

  userId: z.number().nullable(),

  firstName: z.string().min(1, "FirstName is required"),
  middleName: z.string().nullable(),
  lastName: z.string().min(1, "LastName is required"),

  title: z.string().nullable(),
  credential: z.string().nullable(),

  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),

  cityId: z.number().nullable(),
  
  stateId: z.number().nullable(),

  countryId: z.number().nullable(),
  //if required to set - for numeric
  // countryId: z.number().nullable().refine((val) => val !== null, {
  //   message: "Country is required",
  // }),

  zip: z.string().nullable(),

  profileImage: z.any().nullable(),

  active: z.boolean().nullable(),

  code: z.string().nullable(),
  timeZone: z.string().nullable(),

  dob: z.string().nullable(),
  registrationDate: z.string().nullable(),

  subscriptionId: z.number().nullable(),

  signature: z.any().nullable(),
  upinNo: z.string().nullable(),
  npiNo: z.string().nullable(),

  bwoVcsign: z.any().nullable(),
  keyword: z.string().nullable(),

  sms: z.boolean().nullable(),

  referredBy: z.number().nullable(),
  referredbyOther: z.string().nullable(),

  salesRep: z.number().nullable(),

  cliaCertification: z.boolean().nullable(),
  cliaCertificationNo: z.string().nullable(),

  isAddedSendGrid: z.boolean().nullable(),
  diseaseList: z.array(z.number()).nullable(),
  clinicianContact: clinicianContactSchema.nullable().optional(),
  clinicianRecruits: clinicianRecruitSchema.nullable().optional(),

  userDetail: userModelSchema.nullable().optional(),
});

export type ClinicianForm = z.infer<typeof clinicianSchema>;