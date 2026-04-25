import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastService } from "@/services/toastService";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Badge,
} from "reactstrap";
import { RootState } from "@/store";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer from "Components/Common/TableContainer";
import DeleteModal from "Components/Common/DeleteModal";
import { ClinicModel, ClinicListItem } from "@/types/admin/clinic/clinic.types";
import {
  fetchClinics,
  saveClinic,
  removeClinic,
} from "@/slices/admin/clinic/clinicThunk";
import {
  setSelected,
  resetClinicState,
  clearError,
} from "@/slices/admin/clinic/clinicSlice";

import { commonService } from "@/services/commonService";
import type { SelectOption, SelectStringOption } from "@/types/api.types";
import { timezoneService, Timezone } from "@/services/timezoneService";
import type { Country, State, City } from "@/services/commonService";
import CreatableSelect from "react-select/creatable";
import type { SingleValue } from "react-select";
import { OrganizationListItem } from "@/types/admin/organization/organization.type";
import organizationService from "@/services/admin/organization/organizationService";
// Types - Dropdown Listbox

const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;
/**
 * Clinic Component with Server-Side Pagination & Search
 * Uses TableContainer with server-side data fetching
 */

const emptyModel: ClinicModel = {
  id: 0,
  clientId: clientId || 1,
  organizationId: 3,
  code: "***",
  name: null,
  addressLine1: null,
  addressLine2: null,
  cityId: null,
  cityName: null,
  stateId: null,
  stateName: null,
  countryId: 231,
  countryName: null,
  zip: null,
  contact1: null,
  contact2: null,
  active: true,
  timezone: "Eastern Standard Time",
};

/**
 * Map list row → editable model.
 * Cast to `any` because OrganizationListItem is typed with legacy underscore
 * names but the API actually returns camelCase at runtime.
 */
const toModel = (clinic: ClinicListItem): ClinicModel => {
  return {
    id: clinic.id,
    clientId: clinic.client_Id || clientId,
    organizationId: clinic.organization_Id || 3,
    code: clinic.code,
    name: clinic.name,
    addressLine1: clinic.address_Line1,
    addressLine2: clinic.address_Line2,
    cityId: clinic.city_Id,
    cityName: clinic.cityName,
    stateId: clinic.state_Id,
    stateName: clinic.stateName,
    countryId: clinic.country_Id,
    countryName: clinic.countryName,
    zip: clinic.zip,
    contact1: clinic.contact1,
    contact2: clinic.contact2,
    active: clinic.active === "Yes" ? true : false,
    timezone: clinic.timezone,
  };
};

const ClinicList: React.FC = () => {
  document.title = "Clinics | Virtual Clinic";

  const dispatch = useDispatch<any>();
  const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;

  // Redux state
  const {
    list,
    loading,
    saving,
    success,
    error,
    message,
    totalPages,
    currentPage,
    pageSize,
    totalRecords,
  } = useSelector((state: RootState) => state.Clinic);

  // Local UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [form, setForm] = useState<ClinicModel>(emptyModel);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>(
    [],
  );
  const [timezone, setTimezone] = useState<Timezone[]>([]);

  // react-select options (memoized)
  const organizationOptions = useMemo<SelectOption[]>(
    () =>
      organizations.map((c) => ({ value: Number(c.id), label: c.name ?? "" })),
    [organizations],
  );
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

  // set values of dropdown
  const selectedOrganization = useMemo(
    () =>
      organizationOptions.find((o) => o.value === form.organizationId) ?? null,
    [countryOptions, form.countryId],
  );

  const selectedCountry = useMemo(
    () => countryOptions.find((o) => o.value === form.countryId) ?? null,
    [countryOptions, form.countryId],
  );

  const selectedState = useMemo(
    () => stateOptions.find((o) => o.value === form.stateId) ?? null,
    [stateOptions, form.stateId],
  );

  const selectedCity = useMemo(
    () => cityOptions.find((o) => o.value === form.cityId) ?? null,
    [cityOptions, form.cityId],
  );

  const selectedTimezone = useMemo(
    () => timezoneOptions.find((o) => o.value === form.timezone) ?? null,
    [timezoneOptions, form.timezone],
  );

  // Server-side pagination & search state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageNum, setPageNum] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Ref to track last fetched query to prevent duplicate calls
  const lastQueryRef = useRef<string>("");

  // Handle server-side query changes from TableContainer
  // No memoization needed - state updates are the priority here
  const handleServerChange = (query: any) => {
    //console.log("📌 handleServerChange called with:", query);

    if (query.page !== undefined) {
      setPageNumber(query.page);
      //console.log("✓ setPageNumber to:", query.page);
    }
    if (query.pageSize !== undefined) {
      setPageNum(query.pageSize);
      //console.log("✓ setPageNum to:", query.pageSize);
    }
    if (query.search !== undefined) {
      setSearchTerm(query.search);
      //console.log("✓ setSearchTerm to:", query.search);
    }
  };

  // Country → load states, reset state & city
  // Organization
  const handleOrganizationChange = (option: SingleValue<SelectOption>) => {
    setForm((prev) => ({ ...prev, organizationId: option?.value ?? 3 }));
  };

  //Country
  const handleCountryChange = async (option: SingleValue<SelectOption>) => {
    const countryId = option?.value ?? null;
    setForm((prev) => ({ ...prev, countryId, stateId: null, cityId: null }));
    setStates([]);
    setCities([]);
    if (countryId) {
      setLoadingStates(true);
      try {
        const data = await commonService.getStates(countryId);
        setStates(data);
      } catch {
        /* ignore */
      } finally {
        setLoadingStates(false);
      }
    }
  };

  // State → load cities, reset city
  const handleStateChange = async (option: SingleValue<SelectOption>) => {
    const stateId = option?.value ?? null;
    setForm((prev) => ({ ...prev, stateId, cityId: null }));
    setCities([]);
    if (stateId) {
      setLoadingCities(true);
      try {
        const data = await commonService.getCities(stateId);
        setCities(data);
      } catch {
        /* ignore */
      } finally {
        setLoadingCities(false);
      }
    }
  };

  // City
  const handleCityChange = (option: SingleValue<SelectOption>) => {
    setForm((prev) => ({ ...prev, cityId: option?.value ?? null }));
  };

  // Timezone
  const handleTimezoneChange = (option: SingleValue<SelectStringOption>) => {
    setForm((prev) => ({ ...prev, timezone: option?.value ?? null }));
  };

  // Fetch clinics when page, size, or search changes
  // Use ref to prevent duplicate fetches in strict mode or from loops
  useEffect(() => {
    // const currentQuery = JSON.stringify({
    //   clientId,
    //   pageNumber,
    //   pageSize: pageNum,
    //   search: searchTerm,
    // });

    // console.log("📌 Fetch useEffect triggered. Query:", currentQuery);

    // if (lastQueryRef.current === currentQuery) {
    //   console.log("⏭️  Skipped (duplicate query)");
    //   return;
    // }

    // console.log("📡 Fetching data. Previous query:", lastQueryRef.current);
    // lastQueryRef.current = currentQuery;

    dispatch(
      fetchClinics({
        clientId,
        pageNumber,
        pageSize: pageNum,
        search: searchTerm,
      }),
    );
    organizationService
      .getByClientId(clientId)
      .then((res) => {
        setOrganizations(res.data);
      })
      .catch(console.error);
    commonService.getCountries().then(setCountries).catch(console.error);
    timezoneService.getTimezones().then(setTimezone).catch(console.error);
  }, [pageNumber, pageNum, searchTerm, clientId, dispatch]);

  // Show success toast and close modal (only after save/delete, not after pagination)
  useEffect(() => {
    if (success && message) {
      // ✅ Check BEFORE resetting form - this is crucial!
      // Otherwise useEffect runs twice and form.id changes to 0
      const isNewRecord = form.id === 0;

      toastService.success(message);
      setModalOpen(false);
      setDeleteModal(false); // Close delete modal too
      // Reset form only on success
      setForm(emptyModel);
      setFormErrors({});

      // ✅ ONLY reset to page 1 for NEW records (add)
      // For EDIT/DELETE, stay on current page but refresh the list
      if (isNewRecord) {
        // New record added → go to page 1 (triggers fetch via useEffect)
        setPageNumber(1);
        setPageNum(10);
        setSearchTerm("");
        lastQueryRef.current = "";
      } else {
        // Editing/Deleting → stay on current page but refresh the list
        // Use closure to capture current pagination values
        const currentPageNum = pageNumber;
        const currentPageSize = pageNum;
        const currentSearchTerm = searchTerm;

        lastQueryRef.current = ""; // Reset to allow fetch even if query is same
        dispatch(
          fetchClinics({
            clientId,
            pageNumber: currentPageNum,
            pageSize: currentPageSize,
            search: currentSearchTerm,
          }),
        );
      }

      // Clear success state after a delay
      const timer = setTimeout(() => {
        dispatch(resetClinicState());
      }, 2000);
      return () => clearTimeout(timer);
    }
    // ✅ Only depend on success/message, NOT on pageNumber/pageSize/searchTerm
    // This prevents double-trigger when pagination changes
  }, [success, message, dispatch, clientId, form.id]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toastService.error(error);
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        header: "Code",
        accessorKey: "code",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Name",
        accessorKey: "name",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Organization",
        accessorKey: "organizationName",
        enableSorting: false,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "City",
        accessorKey: "cityName",
        enableSorting: true,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "State",
        accessorKey: "stateName",
        enableSorting: true,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "Contact",
        accessorKey: "contact1",
        enableSorting: false,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "Active",
        accessorKey: "active",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell: any) => {
          const val = cell.getValue();
          const isActive = val === true || val === "Yes" || val === "1";
          return (
            <Badge
              color={isActive ? "success" : "secondary"}
              className="font-size-12"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        header: "Actions",
        accessorKey: "id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell: any) => {
          const row: ClinicListItem = cell.row.original;
          return (
            <div className="d-flex gap-2">
              <Button
                color="primary"
                size="sm"
                outline
                onClick={() => handleEdit(row)}
                title="Edit clinic"
              >
                <i className="mdi mdi-pencil" />
              </Button>
              <Button
                color="danger"
                size="sm"
                outline
                onClick={() => handleDeleteOpen(row.id)}
                title="Delete clinic"
              >
                <i className="mdi mdi-trash-can-outline" />
              </Button>
            </div>
          );
        },
      },
    ],
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Handlers
  const handleAddNew = () => {
    dispatch(setSelected(null));
    setForm(emptyModel);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (row: ClinicListItem) => {
    const model: ClinicModel = toModel(row);
    console.log(row);
    dispatch(setSelected(model));
    setForm(model);
    setFormErrors({});
    // Fetch states & cities in parallel before opening modal
    const [statesData, citiesData] = await Promise.all([
      model.countryId
        ? commonService.getStates(model.countryId).catch((): State[] => [])
        : Promise.resolve<State[]>([]),
      model.stateId
        ? commonService.getCities(model.stateId).catch((): City[] => [])
        : Promise.resolve<City[]>([]),
    ]);

    // Batch all state updates — modal opens with everything ready
    setStates(statesData);
    setCities(citiesData);
    setForm({
      ...model,
      countryId: Number(model.countryId),
      stateId: Number(model.stateId),
      cityId: Number(model.cityId),
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setFormErrors({});
    setForm(emptyModel);
    dispatch(setSelected(null));
  };

  const handleDeleteOpen = (id: number) => {
    setDeleteTarget(id);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget !== null) {
      dispatch(removeClinic(deleteTarget));
    }
    setDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name?.trim()) errors.name = "Name is required";
    if (!form.cityId?.toString().trim()) errors.cityId = "City is required";
    if (!form.stateId?.toString().trim()) errors.stateId = "State is required";
    if (!form.countryId?.toString().trim())
      errors.countryId = "Country is required";
    if (!form.organizationId?.toString().trim())
      errors.organizationId = "Organization is required";
    //if (!form.code?.trim()) errors.code = "Code is required";
    //if (!form.contact1?.trim()) errors.contact1 = "Contact is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(saveClinic(form));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Admin" breadcrumbItem="Clinics" />
          <Row>
            <Col xs={12}>
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={list || []}
                    isGlobalFilter
                    isAddButton
                    isPagination
                    isCustomPageSize
                    isLoading={loading}
                    handleUserClick={handleAddNew}
                    buttonClass="btn btn-info btn-rounded"
                    buttonName=" + Add"
                    // Server-side pagination props
                    searchPlaceholder="Search clinic...."
                    isServerSidePagination={true}
                    onServerChange={handleServerChange}
                    serverSideTotalRecords={totalRecords}
                    serverSideCurrentPage={currentPage}
                    serverSidePageSize={pageSize}
                    serverSideTotalPages={totalPages}
                    serverSideSearchTerm={searchTerm}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Add / Edit Modal*/}
      <Modal isOpen={modalOpen} toggle={handleModalClose} size="lg" centered>
        <ModalHeader toggle={handleModalClose}>
          {form.id === 0 ? "Add Clinic" : "Edit Clinic"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            {/* Code / Name */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="organizationId">
                    Organization <span className="text-danger">*</span>
                  </Label>
                  <CreatableSelect<SelectOption>
                    inputId="organizationId"
                    options={organizationOptions}
                    value={selectedOrganization}
                    onChange={handleOrganizationChange}
                    placeholder="Search Organization..."
                    isClearable
                    menuPlacement="auto"
                    styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                  {formErrors.organizationId && (
                    <span className="text-danger small">
                      {formErrors.organizationId}
                    </span>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="name">
                    Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name ?? ""}
                    onChange={handleChange}
                    invalid={!!formErrors.name}
                    placeholder="Clinic name"
                  />
                  {formErrors.name && (
                    <span className="text-danger small">{formErrors.name}</span>
                  )}
                </FormGroup>
              </Col>
            </Row>

            {/* Address */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={form.addressLine1 ?? ""}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={form.addressLine2 ?? ""}
                    onChange={handleChange}
                    placeholder="Suite, floor, etc."
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Country / State */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="countryName">
                    Country<span className="text-danger">*</span>
                  </Label>
                  <CreatableSelect<SelectOption>
                    inputId="countryId"
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    placeholder="Search country..."
                    isClearable
                    menuPlacement="auto"
                    styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                  {formErrors.countryId && (
                    <span className="text-danger small">
                      {formErrors.countryId}
                    </span>
                  )}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label>
                    State <span className="text-danger">*</span>{" "}
                    {loadingStates && <Spinner size="sm" className="ms-1" />}
                  </Label>
                  <CreatableSelect<SelectOption>
                    inputId="stateId"
                    options={stateOptions}
                    value={selectedState}
                    onChange={handleStateChange}
                    placeholder={
                      form.countryId
                        ? "Search state..."
                        : "Select country first"
                    }
                    isClearable
                    isDisabled={!form.countryId || loadingStates}
                    isLoading={loadingStates}
                    menuPlacement="auto"
                    styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                  {formErrors.stateId && (
                    <span className="text-danger small">
                      {formErrors.stateId}
                    </span>
                  )}
                </FormGroup>
              </Col>
            </Row>

            {/* Zip / Country */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    City <span className="text-danger">*</span>
                    {loadingCities && <Spinner size="sm" className="ms-1" />}
                  </Label>
                  <CreatableSelect<SelectOption>
                    inputId="cityId"
                    options={cityOptions}
                    value={selectedCity}
                    onChange={handleCityChange}
                    placeholder={
                      form.stateId ? "Search city..." : "Select state first"
                    }
                    isClearable
                    isDisabled={!form.stateId || loadingCities}
                    isLoading={loadingCities}
                    menuPlacement="auto"
                    styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                  {formErrors.cityId && (
                    <span className="text-danger small">
                      {formErrors.cityId}
                    </span>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="zip">Zip / Postal Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    value={form.zip ?? ""}
                    onChange={handleChange}
                    placeholder="12345"
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Contact Information */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="contact1">
                    Contact 1 <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="contact1"
                    name="contact1"
                    value={form.contact1 ?? ""}
                    onChange={handleChange}
                    invalid={!!formErrors.contact1}
                    placeholder="Phone or email"
                  />
                  {formErrors.contact1 && (
                    <span className="text-danger small">
                      {formErrors.contact1}
                    </span>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="contact2">Contact 2</Label>
                  <Input
                    id="contact2"
                    name="contact2"
                    value={form.contact2 ?? ""}
                    onChange={handleChange}
                    placeholder="Optional contact"
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Timezone */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="timezone">
                    Timezone<span className="text-danger">*</span>
                  </Label>
                  <CreatableSelect<SelectStringOption>
                    inputId="timezone"
                    options={timezoneOptions}
                    value={selectedTimezone}
                    onChange={handleTimezoneChange}
                    placeholder="Search Timezone..."
                    isClearable
                    menuPlacement="auto"
                    styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Active */}
            <Row>
              <Col md={12}>
                <FormGroup check className="mt-1">
                  <Input
                    id="active"
                    name="active"
                    type="checkbox"
                    checked={form.active ?? true}
                    onChange={handleChange}
                  />
                  <Label for="active" check className="ms-2">
                    Active
                  </Label>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              outline
              onClick={handleModalClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Saving...
                </>
              ) : form.id === 0 ? (
                "Add Clinic"
              ) : (
                "Save Changes"
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Delete Confirmation*/}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteConfirm}
        onCloseClick={() => setDeleteModal(false)}
      />
    </React.Fragment>
  );
};

export default ClinicList;
