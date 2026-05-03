import React, { useEffect, useMemo, useState } from "react";
//react hook form
import { useFormContext } from "react-hook-form";

import { ClinicianForm } from "@/types/admin/clinician/clinician.schema";
import { Col, Row } from "reactstrap";
import {
  RHFDatePicker,
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

const ClinicianProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setValue, watch } = useFormContext<ClinicianForm>();

  const values = watch();
  const isAddMode = !id || id === "0";

  const [timezone, setTimezone] = useState<Timezone[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
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
        value: tz.nameOfTimeZone,
        label: tz.nameOfTimeZone,
      })),
    [timezone],
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
    console.log("Country changed to:", countryId);

    setValue("countryId", countryId);
    setValue("stateId", null);
    setValue("cityId", null);
    setStates([]);
    setCities([]);

    if (countryId) {
      setLoadingStates(true);
      try {
        const data = await commonService.getStates(countryId);
        console.log("States loaded:", data.length);
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
    console.log("State changed to:", stateId);

    setValue("stateId", stateId);
    setValue("cityId", null);
    setCities([]);

    if (stateId) {
      setLoadingCities(true);
      try {
        const data = await commonService.getCities(stateId);
        console.log("Cities loaded:", data.length);
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
    console.log("City changed to:", cityId);
    setValue("cityId", cityId);
  };

  // Timezone change
  const handleTimezoneChange = (option: any) => {
    const timezone = getTimezoneValue(option);
    console.log("Timezone changed to:", timezone);
    setValue("timeZone", timezone);
  };

  // Load countries and timezones on mount
  useEffect(() => {
    commonService.getCountries().then(setCountries).catch(console.error);
    timezoneService.getTimezones().then(setTimezone).catch(console.error);
  }, []);

  // Auto-load states when country is selected (add or edit mode)
  useEffect(() => {
    if (values.countryId) {
      console.log("Loading states for country:", values.countryId);
      setLoadingStates(true);

      commonService
        .getStates(values.countryId)
        .then((data) => {
          console.log("States loaded:", data.length);
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
      console.log("Loading cities for state:", values.stateId);
      setLoadingCities(true);

      commonService
        .getCities(values.stateId)
        .then((data) => {
          console.log("Cities loaded:", data.length);
          setCities(data);
        })
        .catch((error) => console.error("Failed to load cities:", error))
        .finally(() => setLoadingCities(false));
    } else {
      // Clear cities if no state selected
      setCities([]);
    }
  }, [values.stateId]);

console.log("profileImage watch:", watch("profileImage"));
console.log("imageUrl:", values.profileImage);

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
      <Row></Row>
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
          <RHFInput 
            label="Address Line1"
            name="address1"/>
          </Col>
          <Col sm={12} md={6}>
          <RHFInput 
            label="Address Line2"
            name="address2"/>          
          </Col>          
        </Row>
        </Col>
        <Col sm={12} md={3}>
          <RHFInput 
            label="Zip"
            name="zip"/>        
        </Col>
      </Row>
       <div className="border-bottom my-3" />
    </>
  );
};

export default ClinicianProfile;
