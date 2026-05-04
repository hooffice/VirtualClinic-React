import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { useParams } from "react-router-dom";
import { Col, FormGroup, Label, Row } from "reactstrap";
import {
  RHFCheckBox,
  RHFFlatpickr,
  RHFInput,
  RHFProfileImage,
  RHFSelect,
  RHFSelect2,
} from "@/Components/Common/Forms";
import type { SelectOption, SelectStringOption } from "@/types/api.types";
import { ClinicianForm } from "@/types/admin/clinician/clinician.schema";
import {
  type Country,
  type State,
  type City,
  commonService,
  DiseaseList,
  UserType,
} from "@/services/commonService";
import { timezoneService, Timezone } from "@/services/timezoneService";
import { ReferredBy, referredByService } from "@/services/referredByService";
import { SalesRep, salesRepService } from "@/services/salesRepService";
import { Affiliation, affiliationService } from "@/services/affiliationService";
import { BillingProcedureTypeList } from "@/types/admin/clinician/clinician.types";
import { ClinicListItem } from "@/types/admin/clinic/clinic.types";
import clinicService from "@/services/admin/clinic/clinicService";
import clinicianService from "@/services/admin/clinician/clinicianService";
import ResetUserModal from "./resetUserModel";

// ============================================================================
// COMPONENT
// ============================================================================
const clinicianProfile: React.FC = () => {
  // ========================================================================
  // HOOKS & CONTEXT
  // ========================================================================
  const { id } = useParams<{ id: string }>();
  const { setValue, watch } = useFormContext<ClinicianForm>();
  const values = watch();

  // ========================================================================
  // ENVIRONMENT VARIABLES
  // ========================================================================
  const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================
  const isAddMode = !id || id === "0";

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  /**
   * Safely parse dates from various formats (Date objects, ISO strings, null)
   */
  // const parseDate = (value: any): Date | null => {
  //   if (!value) return null;
  //   if (value instanceof Date) return value;
  //   if (typeof value === "string") {
  //     const parsed = new Date(value);
  //     return isNaN(parsed.getTime()) ? null : parsed;
  //   }
  //   return null;
  // };

  // ========================================================================
  // STATE VARIABLES - Reference Lists
  // ========================================================================
  const [timezone, setTimezone] = useState<Timezone[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [referredByList, setReferredByList] = useState<ReferredBy[]>([]);
  const [salesRepList, setSalesRepList] = useState<SalesRep[]>([]);
  const [clinic, setClinic] = useState<ClinicListItem[]>([]);
  const [disease, setDisease] = useState<DiseaseList[]>([]);
  const [billingProcedureList, setBillingProcedureList] = useState<
    BillingProcedureTypeList[]
  >([]);
  const [usertype, setUsertype] = useState<UserType[]>([]);

  // ========================================================================
  // STATE VARIABLES - Loading States
  // ========================================================================
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // ========================================================================
  // MEMOIZED OPTIONS - Address Section
  // ========================================================================
  const countryOptions = useMemo<SelectOption[]>(
    () => countries.map((c) => ({ value: Number(c.id), label: c.name })),
    [countries],
  );

  const stateOptions = useMemo<SelectOption[]>(
    () => states.map((s) => ({ value: Number(s.id), label: s.name })),
    [states],
  );

  const cityOptions = useMemo<SelectOption[]>(
    () => cities.map((c) => ({ value: Number(c.id), label: c.name })),
    [cities],
  );

  const timezoneOptions = useMemo<SelectStringOption[]>(
    () =>
      timezone.map((tz) => ({
        value: tz.timeZoneTime,
        label: tz.timeZoneTime,
      })),
    [timezone],
  );

  // ========================================================================
  // MEMOIZED OPTIONS - Clinic & Details Section
  // ========================================================================
  const clinicOptions = useMemo<SelectOption[]>(
    () =>
      clinic.map((c) => ({
        value: c.id,
        label: c.name ?? "",
      })),
    [clinic],
  );

  const affiliationOptions = useMemo<SelectStringOption[]>(
    () =>
      affiliations.map((a) => ({
        value: a.affiliation,
        label: a.affiliation,
      })),
    [affiliations],
  );

  const billingProcedureTypeOptions = useMemo<SelectOption[]>(
    () =>
      billingProcedureList.map((d) => ({
        value: d.id,
        label: d.billingProcedure ?? "",
      })),
    [billingProcedureList],
  );

  const diseaseOptions = useMemo<SelectOption[]>(
    () =>
      disease.map((d) => ({
        value: d.id,
        label: d.name ?? "",
      })),
    [disease],
  );

  // ========================================================================
  // MEMOIZED OPTIONS - Other Dropdowns
  // ========================================================================
  const salesRepOptions = useMemo<SelectOption[]>(
    () =>
      salesRepList.map((s) => ({
        value: s.id,
        label: s.salesRep,
      })),
    [salesRepList],
  );

  const referredByOptions = useMemo<SelectOption[]>(
    () =>
      referredByList.map((r) => ({
        value: r.id,
        label: r.referredBy,
      })),
    [referredByList],
  );

  const usertypeOptions = useMemo<SelectOption[]>(
    () =>
      usertype.map((d) => ({
        value: d.id,
        label: d.type ?? "",
      })),
    [usertype],
  );

  // ========================================================================
  // EVENT HANDLERS - Address/Location (Cascading Dropdowns)
  // ========================================================================

  /**
   * Handle Country selection
   * Loads states for the selected country and resets state/city
   */
  const handleCountryChange = async (value: any) => {
    const countryId =
      typeof value === "number" || typeof value === "string" ? value : null;

    setValue("countryId", countryId as number);
    setValue("stateId", null);
    setValue("cityId", null);
    setStates([]);
    setCities([]);

    if (countryId !== null && countryId !== undefined && countryId !== "") {
      setLoadingStates(true);
      try {
        const data = await commonService.getStates(Number(countryId));
        setStates(data);
      } catch (error) {
        console.error("Failed to load states:", error);
      } finally {
        setLoadingStates(false);
      }
    }
  };

  /**
   * Handle State selection
   * Loads cities for the selected state and resets city
   */
  const handleStateChange = async (value: any) => {
    const stateId =
      typeof value === "number" || typeof value === "string" ? value : null;

    setValue("stateId", stateId as number);
    setValue("cityId", null);
    setCities([]);

    if (stateId !== null && stateId !== undefined && stateId !== "") {
      setLoadingCities(true);
      try {
        const data = await commonService.getCities(Number(stateId));
        setCities(data);
      } catch (error) {
        console.error("Failed to load cities:", error);
      } finally {
        setLoadingCities(false);
      }
    }
  };

  /**
   * Handle City selection
   */
  const handleCityChange = (value: any) => {
    const cityId =
      typeof value === "number" || typeof value === "string" ? value : null;
    setValue("cityId", cityId as number);
  };

  /**
   * Handle Timezone selection
   */
  const handleTimezoneChange = (value: any) => {
    const timezone = typeof value === "string" ? value : null;
    setValue("timeZone", timezone);
  };

  // ========================================================================
  // EVENT HANDLERS - Clinic & Affiliation
  // ========================================================================

  /**
   * Handle Primary Clinic selection
   */
  const handleClinicChange = (value: any) => {
    const id = typeof value === "number" ? value : null;
    setValue("clinicianRecruits.clinicId", id);
  };

  /**
   * Handle Affiliation selection
   */
  const handleaffiliationChange = (value: any) => {
    const id = typeof value === "string" ? value : null;
    setValue("clinicianRecruits.affiliation", id);
  };

  /**
   * Handle Billing Procedure Type selection
   * Defaults to 0 (none) when value is null/undefined
   */
  const handleBillingProcedureTypeChange = (value: any) => {
    const id = value === null || value === undefined ? 0 : value;
    setValue("clinicianRecruits.billingProcedure", id);
  };

  // ========================================================================
  // EVENT HANDLERS - Sales Rep & Referred By
  // ========================================================================

  /**
   * Handle Sales Rep selection
   */
  const handlesalerepChange = (value: any) => {
    const id = typeof value === "number" ? value : null;
    setValue("salesRep", id);
  };

  /**
   * Handle Referred By selection
   */
  const handlereferredbyChange = (value: any) => {
    const id = typeof value === "number" ? value : null;
    setValue("referredBy", id);
  };

  // ========================================================================
  // EVENT HANDLERS - Disease & User Type
  // ========================================================================

  /**
   * Handle User Type selection
   */
  const handleUserTypeChange = (value: any) => {
    const id = typeof value === "number" ? value : null;
    setValue("userDetail.userType", id);
  };

  // ========================================================================
  // EFFECTS - Data Fetching
  // ========================================================================

  /**
   * Load reference data on mount
   * Fetches: Timezones, Countries, Affiliations, Referred By, Sales Rep,
   * Clinics, Diseases, Billing Procedure Types, User Types
   */
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [
          timezoneData,
          countryData,
          affiliationsData,
          referredByData,
          salesRepData,
          clinicData,
          diseaseListData,
          billingProcedureListData,
          userTypeData,
        ] = await Promise.all([
          timezoneService.getTimezones(),
          commonService.getCountries(),
          affiliationService.getAffiliations(),
          referredByService.getReferredByList(),
          salesRepService.getSalesRepList(),
          clinicService.getClinicByClient(clientId),
          commonService.getDiseaseList(),
          clinicianService.getBillingProcedureType(),
          commonService.getUserType(),
        ]);

        setTimezone(timezoneData);
        setCountries(countryData);
        setAffiliations(affiliationsData);
        setReferredByList(referredByData);
        setSalesRepList(salesRepData);
        setClinic(clinicData.data);
        setDisease(diseaseListData);
        setBillingProcedureList(billingProcedureListData);
        setUsertype(userTypeData);
      } catch (err) {
        console.error("Failed to fetch reference data:", err);
      }
    };

    fetchReferenceData();
  }, [clientId]);

  // ========================================================================
  // EFFECTS - Cascading Data Loading
  // ========================================================================

  /**
   * Auto-load states when country is selected
   */
  useEffect(() => {
    if (values.countryId) {
      setLoadingStates(true);

      commonService
        .getStates(values.countryId)
        .then((data) => {
          setStates(data);
        })
        .catch((error) => console.error("Failed to load states:", error))
        .finally(() => setLoadingStates(false));
    } else {
      setStates([]);
      setCities([]);
    }
  }, [values.countryId]);

  /**
   * Auto-load cities when state is selected
   */
  useEffect(() => {
    if (values.stateId) {
      setLoadingCities(true);

      commonService
        .getCities(values.stateId)
        .then((data) => {
          setCities(data);
        })
        .catch((error) => console.error("Failed to load cities:", error))
        .finally(() => setLoadingCities(false));
    } else {
      setCities([]);
    }
  }, [values.stateId]);

  //========================================================================
  // RESET USERNAME/PASSWORD MODEL
  //========================================================================
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  const toggleResetModal = () => {
    setIsResetModalOpen((prev) => !prev);
  };

  // ========================================================================
  // RENDER - FORM JSX
  // ========================================================================
  return (
    <>
      {/* SECTION: Personal Information */}
      <Row className="align-items-stretch">
        {/* Left: Name, Title, Credential, DOB */}
        <Col sm={12} md={9}>
          <Row className="g-2 mb-2">
            <Col sm={12} md={4}>
              <RHFInput
                label="First Name"
                name="firstName"
                required
                placeholder="First Name"
              />
            </Col>
            <Col sm={12} md={4}>
              <RHFInput
                label="Middle Name"
                name="middleName"
                placeholder="Middle Name"
              />
            </Col>
            <Col sm={12} md={4}>
              <RHFInput
                label="Last Name"
                name="lastName"
                required
                placeholder="Last Name"
              />
            </Col>
          </Row>

          <Row className="g-2">
            <Col sm={12} md={4}>
              <RHFInput label="Title" name="title" placeholder="Title" />
            </Col>
            <Col sm={12} md={4}>
              <RHFInput
                label="Credential"
                name="credential"
                placeholder="Credential"
              />
            </Col>
            <Col sm={12} md={4}>
              <RHFFlatpickr label="DOB" name="dob" mode="date" />
            </Col>
          </Row>
        </Col>

        {/* Right: Profile Image */}
        <Col sm={12} md={3} className="d-flex">
          <div
            className="w-100 border rounded p-2 d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "100%" }}
          >
            <RHFProfileImage
              label="Profile Image"
              name="profileImage"
              imageUrl={values.profileImage}
              isEdit={true}
            />
          </div>
        </Col>
      </Row>

      {/* SECTION: Contact Information */}
      <Row className="align-items-stretch">
        <Col sm={12} md={3}>
          <RHFInput
            label="Primary Contact"
            required={true}
            name="clinicianContact.primaryContact"
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFInput
            label="Secondary Contact"
            name="clinicianContact.secondaryContact"
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFInput
            label="Primary Email"
            required={true}
            name="clinicianContact.primaryEmail"
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFInput
            label="Secondary Email"
            name="clinicianContact.secondaryEmail"
          />
        </Col>
      </Row>

      {/* SECTION: Address Information */}
      <div className="border-bottom my-3" />
      <b>Address</b>
      <div className="border-bottom my-3" />

      <Row>
        <Col sm={12} md={3}>
          <RHFSelect2
            label="Timezone"
            name="timeZone"
            options={timezoneOptions}
            onChange={handleTimezoneChange}
            isClearable
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="Country"
            name="countryId"
            required={true}
            options={countryOptions}
            onChange={handleCountryChange}
            isClearable
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="State"
            name="stateId"
            options={stateOptions}
            onChange={handleStateChange}
            isLoading={loadingStates}
            isClearable
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="City"
            name="cityId"
            options={cityOptions}
            onChange={handleCityChange}
            isLoading={loadingCities}
            isClearable
          />
        </Col>
      </Row>

      <Row className="align-items-stretch">
        <Col sm={12} md={9}>
          <Row>
            <Col sm={12} md={6}>
              <RHFInput label="Address Line 1" name="address1" />
            </Col>
            <Col sm={12} md={6}>
              <RHFInput label="Address Line 2" name="address2" />
            </Col>
          </Row>
        </Col>
        <Col sm={12} md={3}>
          <RHFInput label="Zip Code" name="zip" />
        </Col>
      </Row>

      {/* SECTION: Professional Details */}
      <div className="border-bottom my-3" />
      <Row className="align-items-stretch">
        <Col sm={12} md={2}>
          <RHFInput label="NPI" name="npiNo" />
        </Col>
        <Col sm={12} md={2}>
          <RHFInput label="UPI" name="upinNo" />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="Sales Rep"
            name="salesRep"
            options={salesRepOptions}
            onChange={handlesalerepChange}
            isClearable
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="Refer By"
            name="referredBy"
            options={referredByOptions}
            onChange={handlereferredbyChange}
            isClearable
          />
        </Col>
        {values.referredBy == 8 && (
          <Col sm={12} md={2}>
            <RHFInput label="Other Detail" name="referredbyOther" />
          </Col>
        )}
      </Row>

      {/* SECTION: Clinic & Billing Information */}
      <Row className="align-items-stretch">
        <Col sm={12} md={3}>
          <RHFSelect
            label="Primary Clinic"
            required={true}
            name="clinicianRecruits.clinicId"
            options={clinicOptions}
            onChange={handleClinicChange}
            isClearable
            isDisabled={true}
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="Affiliation"
            name="clinicianRecruits.affiliation"
            options={affiliationOptions}
            onChange={handleaffiliationChange}
            isClearable
          />
        </Col>
        <Col sm={12} md={2}>
          <RHFInput label="Agent" name="clinicianRecruits.agentId" />
        </Col>
        <Col sm={12} md={2}>
          <RHFSelect
            label="Billing Type"
            required={true}
            name="clinicianRecruits.billingProcedure"
            options={billingProcedureTypeOptions}
            onChange={handleBillingProcedureTypeChange}
            isClearable
          />
        </Col>
        <Col sm={12} md={2}>
          <RHFInput
            label="Coupon Code"
            name="clinicianRecruits.tempCouponCode"
          />
        </Col>
      </Row>

      {/* SECTION: Status & Certifications */}
      <div className="border-bottom my-3" />
      <Row className="align-items-stretch">
        <Col sm={12} md={3}>
          <RHFCheckBox label="Active" name="active" />
        </Col>
        <Col sm={12} md={3}>
          <RHFCheckBox label="SMS" name="sms" />
        </Col>
        <Col sm={12} md={3}>
          <RHFCheckBox label="CLIA Certification" name="cliaCertification" />
        </Col>
        {values.cliaCertification && (
          <Col sm={12} md={3}>
            <RHFInput
              name="cliaCertificationNo"
              placeholder="CLIA Certificate No"
            />
          </Col>
        )}
      </Row>

      {/* SECTION: Permissions & Signature */}
      <div className="border-bottom my-3" />
      <Row className="align-items-stretch">
        <Col sm={12} md={3}>
          <RHFCheckBox
            label="Can View Bio-Labs"
            name="clinicianRecruits.canViewBioLabs"
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFCheckBox
            label="Can View Agent Commission"
            name="clinicianRecruits.canViewCommission"
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFCheckBox label="Clinician Signature" name="signature" />
        </Col>
        {values.signature && (
          <Col sm={12} md={1} className="d-flex align-items-center">
            <RHFProfileImage
              name="bwoVcsign"
              containerStyle={{
                width: "100%",
                height: "34px",
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Col>
        )}
      </Row>

      {/* SECTION: Disease List */}
      <div className="border-bottom my-3" />
      <Row>
        <Col sm={12} md={12}>
          <RHFSelect
            label="Disease"
            required={true}
            isMulti={true}
            name="diseaseList"
            options={diseaseOptions}
            isClearable
          />
        </Col>
      </Row>

      {/* SECTION: User Account */}
      <div className="border-bottom my-3" />
      <Row className="align-items-stretch">
        <Col sm={12} md={3}>
          <RHFInput
            label="User Name"
            name="userDetail.userName"
            isEdit={isAddMode}
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="User Type"
            name="userDetail.userType"
            isDisabled={true}
            options={usertypeOptions}
            onChange={handleUserTypeChange}
            isClearable
          />
        </Col>
        {!isAddMode && (
          <>
            <Col sm={12} md={3}>
              <FormGroup>
                <Label style={{ visibility: "hidden", fontSize: "12px" }}>
                  .
                </Label>
                <button
                  type="button"
                  className="btn btn-info w-100"
                  style={{ fontSize: "11px" }}
                  onClick={() => {
                    setIsResetPassword(true); // password mode
                    setIsResetModalOpen(true);
                  }}
                >
                  Change Password
                </button>
              </FormGroup>
            </Col>
            <Col sm={12} md={3}>
              <FormGroup>
                <Label style={{ visibility: "hidden", fontSize: "12px" }}>
                  .
                </Label>
                <button
                  type="button"
                  className="btn btn-info w-100"
                  style={{ fontSize: "11px" }}
                  onClick={() => {
                    setIsResetPassword(false); // username mode
                    setIsResetModalOpen(true);
                  }}
                >
                  Change Username
                </button>
              </FormGroup>
            </Col>
          </>
        )}
      </Row>
      <ResetUserModal
        isOpen={isResetModalOpen}
        toggle={toggleResetModal}
        clinicianId={values.id}
        userId={values.userDetail?.userId ?? 0}
        identityId={values.userDetail?.identityId ?? ""}
        userName={values.userDetail?.userName ?? ""}
        isResetPassword={isResetPassword}
        onSuccess={(newUsername) => {
          // Refresh username in form if it was updated
          if (newUsername) {
            setValue("userDetail.userName", newUsername);
          }
        }}
      />
    </>
  );
};

export default clinicianProfile;
