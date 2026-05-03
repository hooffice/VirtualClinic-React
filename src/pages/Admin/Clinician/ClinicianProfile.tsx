import React, { useEffect, useMemo, useState } from "react";
//react hook form
import { useFormContext } from "react-hook-form";

import { ClinicianForm } from "@/types/admin/clinician/clinician.schema";
import { Col, FormGroup, Label, Row } from "reactstrap";
import {
  RHFCheckBox,
  RHFFlatpickr,
  RHFInput,
  RHFProfileImage,
  RHFSelect,
  RHFSelect2,
} from "@/Components/Common/Forms";
import { useParams } from "react-router-dom";
//services & types
import type { SelectOption, SelectStringOption } from "@/types/api.types";
import { timezoneService, Timezone } from "@/services/timezoneService";
import {
  type Country,
  type State,
  type City,
  commonService,
} from "@/services/commonService";
import { ReferredBy, referredByService } from "@/services/referredByService";
import { SalesRep, salesRepService } from "@/services/salesRepService";
import { Affiliation, affiliationService } from "@/services/affiliationService";
import { BillingProcedureList } from "@/types/admin/clinician/clinician.types";
import { ClinicListItem } from "@/types/admin/clinic/clinic.types";

const ClinicianProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setValue, watch, getValues } = useFormContext<ClinicianForm>();

  const values = watch();
  const isAddMode = !id || id === "0";

  // Helper function to parse and format date values
  const parseDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const [timezone, setTimezone] = useState<Timezone[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [referredByList, setReferredByList] = useState<ReferredBy[]>([]);
  const [salesRepList, setSalesRepList] = useState<SalesRep[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [billingProcedureList, setBillingProcedureList] = useState<BillingProcedureList[]>([]);
  const [clinic, setClinic] = useState<ClinicListItem[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

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

  const affiliationOptions = useMemo<SelectOption[]>(
    () =>
      affiliations.map((a) => ({
        value: a.id,
        label: a.affiliation,
      })),
    [affiliations],
  );

  // Helper to extract value from SelectOption or get raw value
  const getOptionValue = (option: any): number | null => {
    if (!option) return null;
    return typeof option === "object" && option.value !== undefined
      ? option.value
      : option;
  };

  const getTimezoneValue = (option: any): string | null => {
    if (!option) return null;
    return typeof option === "object" && option.value !== undefined
      ? option.value
      : option;
  };

  // Country change → load states, reset state & city
  const handleCountryChange = async (option: any) => {
    const countryId = getOptionValue(option);
    //console.log("Country changed to:", countryId);

    setValue("countryId", countryId);
    setValue("stateId", null);
    setValue("cityId", null);
    setStates([]);
    setCities([]);

    if (countryId) {
      setLoadingStates(true);
      try {
        const data = await commonService.getStates(countryId);
        //console.log("States loaded:", data.length);
        setStates(data);
      } catch (error) {
        console.error("Failed to load states:", error);
      } finally {
        setLoadingStates(false);
      }
    }
  };

  // State change → load cities, reset city
  const handleStateChange = async (option: any) => {
    const stateId = getOptionValue(option);
    //console.log("State changed to:", stateId);

    setValue("stateId", stateId);
    setValue("cityId", null);
    setCities([]);

    if (stateId) {
      setLoadingCities(true);
      try {
        const data = await commonService.getCities(stateId);
        //console.log("Cities loaded:", data.length);
        setCities(data);
      } catch (error) {
        console.error("Failed to load cities:", error);
      } finally {
        setLoadingCities(false);
      }
    }
  };

  // City change
  const handleCityChange = (option: any) => {
    const cityId = getOptionValue(option);
    //console.log("City changed to:", cityId);
    setValue("cityId", cityId);
  };

  // Timezone change
  const handleTimezoneChange = (option: any) => {
    const timezone = getTimezoneValue(option);
    //console.log("Timezone changed to:", timezone);
    setValue("timeZone", timezone);
  };

  // Load countries and timezones on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch Timezone
        const timezoneData = await timezoneService.getTimezones();
        setTimezone(timezoneData);
        // Fetch County
        const countryData = await commonService.getCountries();
        setCountries(countryData);

        // Fetch affiliations
        const affiliationsData = await affiliationService.getAffiliations();
        setAffiliations(affiliationsData);

        // Fetch referred by list
        const referredByData = await referredByService.getReferredByList();
        setReferredByList(referredByData);

        // Fetch sales rep list
        const salesRepData = await salesRepService.getSalesRepList();
        setSalesRepList(salesRepData);
      } catch (err) {
        console.error("Failed to fetch reference data:", err);
        setCountries([]);
        setTimezone([]);
        setAffiliations([]);
        setReferredByList([]);
        setSalesRepList([]);
      }
    };
    fetchReferenceData();
  }, []);

  // Auto-load states when country is selected (add or edit mode)
  useEffect(() => {
    if (values.countryId) {
      //console.log("Loading states for country:", values.countryId);
      setLoadingStates(true);

      commonService
        .getStates(values.countryId)
        .then((data) => {
          //console.log("States loaded:", data.length);
          setStates(data);
        })
        .catch((error) => console.error("Failed to load states:", error))
        .finally(() => setLoadingStates(false));
    } else {
      // Clear states if no country selected
      setStates([]);
      setCities([]);
    }
  }, [values.countryId]);

  // Auto-load cities when state is selected (add or edit mode)
  useEffect(() => {
    if (values.stateId) {
      //console.log("Loading cities for state:", values.stateId);
      setLoadingCities(true);

      commonService
        .getCities(values.stateId)
        .then((data) => {
          //console.log("Cities loaded:", data.length);
          setCities(data);
        })
        .catch((error) => console.error("Failed to load cities:", error))
        .finally(() => setLoadingCities(false));
    } else {
      // Clear cities if no state selected
      setCities([]);
    }
  }, [values.stateId]);

  return (
    <>
      <Row className="align-items-stretch">
        {/* LEFT SIDE */}
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

        {/* RIGHT SIDE */}
        <Col sm={12} md={3} className="d-flex">
          <div
            className="w-100 border rounded p-2 d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "100%" }}
          >
            <RHFProfileImage
              label="Profile Image"
              name="profileImage"
              imageUrl={values.profileImage} // from API
              isEdit={true}
            />
          </div>
        </Col>
      </Row>
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
            label="Secondary Enail"
            name="clinicianContact.secondaryEmail"
          />
        </Col>
      </Row>
      <div className="border-bottom my-3" />
      <b>Address</b>
      <div className="border-bottom my-3" />
      <Row>
        <Col sm={12} md={4}>
          <RHFSelect2
            label="Timezone"
            name="timeZone"
            options={timezoneOptions}
            onChange={handleTimezoneChange}
            isClearable
          />
        </Col>
        <Col sm={12} md={2}>
          <RHFSelect
            label="Country"
            name="countryId"
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
              <RHFInput label="Address Line1" name="address1" />
            </Col>
            <Col sm={12} md={6}>
              <RHFInput label="Address Line2" name="address2" />
            </Col>
          </Row>
        </Col>
        <Col sm={12} md={3}>
          <RHFInput label="Zip" name="zip" />
        </Col>
      </Row>
      <div className="border-bottom my-3" />
      <Row className="align-items-stretch">
        <Col sm={12} md={2}>
          <RHFInput label="NPI" name="npiNo" />
        </Col>
        <Col sm={12} md={2}>
          <RHFInput label="UPI" name="upinNo" />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect label="Sales Rep" name="salesRep" options={salesRepOptions} />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect label="Refer By" name="referredBy" options={referredByOptions} />
        </Col>
        {values.referredBy == 8 &&
        <Col sm={12} md={2}>
          <RHFInput label="Other Detail" name="referredbyOther" />
        </Col>
        }
      </Row>
      <Row className="align-items-stretch">
        <Col sm={12} md={3}>
          <RHFSelect
            label="Primary Clinic"
            required={true}
            name="clinicianRecruits.clinicId"
            options={[]}
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="Affiliation"
            name="clinicianRecruits.affiliation"
            options={affiliationOptions}
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
            options={[]}
          />
        </Col>
        <Col sm={12} md={2}>
          <RHFInput
            label="Coupon Code"
            name="clinicianRecruits.tempCouponCode"
          />
        </Col>
      </Row>
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
              placeholder="CLIS Certificate No"
            />
          </Col>
        )}
      </Row>
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
      <div className="border-bottom my-3" />
      <Row>
        <Col sm={12} md={12}>
          <RHFSelect
            label="Disease"
            required={true}
            isMulti={true}
            name="clinicianRecruits.diseaseList"
            options={[]}
          />
        </Col>
      </Row>
      <div className="border-bottom my-3" />
      <Row className="align-items-stretch">
        <Col sm={12} md={3}>
          <RHFInput
            label="User Name"
            name="userDetail.userName"
            disabled={true}
          />
        </Col>
        <Col sm={12} md={3}>
          <RHFSelect
            label="User Type"
            name="userDetail.userType"
            isDisabled={true}
            options={[]}
          />
        </Col>
        <Col sm={12} md={3}>
          <FormGroup>
            <Label style={{ visibility: "hidden", fontSize: "12px" }}>.</Label>
            <button
              type="button"
              className="btn btn-info w-100"
              style={{ fontSize: "11px" }}
            >
              Change Password
            </button>
          </FormGroup>
        </Col>
        <Col sm={12} md={3}>
          <FormGroup>
            <Label style={{ visibility: "hidden", fontSize: "12px" }}>.</Label>
            <button
              type="button"
              className="btn btn-info w-100"
              style={{ fontSize: "11px" }}
            >
              Change UserName
            </button>
          </FormGroup>
        </Col>
      </Row>
    </>
  );
};

export default ClinicianProfile;
