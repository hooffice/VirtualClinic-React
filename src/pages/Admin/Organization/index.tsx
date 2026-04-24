import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastService } from "@/services/toastService";
import {
  Container, Card, CardBody, Row, Col, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, FormFeedback,
  Button, Spinner,
} from "reactstrap";
import { RootState } from "@/store";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer from "Components/Common/TableContainer";
import DeleteModal from "Components/Common/DeleteModal";
import {
  OrganizationListItem,
  OrganizationModel,
} from "@/types/admin/organization/organization.type";
import {
  fetchOrganizations,
  saveOrganization,
  removeOrganization,
} from "@/slices/admin/organization/thunk";
import {
  setSelected,
  resetOrganizationState,
  clearError,
} from "@/slices/admin/organization/reducer";
import { commonService } from "@/services/commonService";
import type { Country, State, City } from "@/services/commonService";
import CreatableSelect from "react-select/creatable";
import type { SingleValue } from "react-select";
import "./Organization.css";

// Types - Dropdown Listbox

type SelectOption = { value: number; label: string };

// Helpers ─ Models

const emptyModel = (clientId: number): OrganizationModel => ({
  id:           0,
  clientId,
  code:         "",
  name:         "",
  addressLine1: "",
  addressLine2: "",
  countryId:    null,
  stateId:      null,
  cityId:       null,
  zip:          "",
  contact1:     "",
  contact2:     "",
  active:       true,
});

/**
 * Map list row → editable model.
 * Cast to `any` because OrganizationListItem is typed with legacy underscore
 * names but the API actually returns camelCase at runtime.
 */
const toModel = (item: OrganizationListItem): OrganizationModel => {
  const r = item as any;
  return {
    id:           r.id,
    clientId:     r.client_ID,
    code:         r.code         ?? "",
    name:         r.name         ?? "",
    addressLine1: r.address_Line1 ?? "",
    addressLine2: r.address_Line2 ?? "",
    countryId:    r.country_ID    ? Number(r.country_ID) : null,
    stateId:      r.state_ID      ? Number(r.state_ID)   : null,
    cityId:       r.city_ID       ? Number(r.city_ID)    : null,
    zip:          r.zip          ?? "",
    contact1:     r.contact1     ?? "",
    contact2:     r.contact2     ?? "",
    active:       r.active === 'Yes' ? true : false,
  };
};

// Component 

const OrganizationList: React.FC = () => {
  document.title = "Organizations | Virtual Clinic";

  const dispatch = useDispatch<any>();
  const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;

  // Redux state
  const { list, loading, saving, success, error, message } = useSelector(
    (state: RootState) => state.Organization
  );

  // Local UI state
  const [modalOpen, setModalOpen]         = useState(false);
  const [deleteModal, setDeleteModal]     = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<number | null>(null);
  const [form, setForm]                   = useState<OrganizationModel>(emptyModel(clientId));
  const [formErrors, setFormErrors]       = useState<Record<string, string>>({});
  const [countries, setCountries]         = useState<Country[]>([]);
  const [states, setStates]               = useState<State[]>([]);
  const [cities, setCities]               = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // react-select options (memoized)
  const countryOptions = useMemo<SelectOption[]>(
    () => countries.map(c => ({ value: Number(c.id), label: c.name })),
    [countries]
  );
  const stateOptions = useMemo<SelectOption[]>(
    () => states.map(s => ({ value: Number(s.id), label: s.name })),
    [states]
  );
  const cityOptions = useMemo<SelectOption[]>(
    () => cities.map(c => ({ value: Number(c.id), label: c.name })),
    [cities]
  );

  // Load list + countries on mount
  useEffect(() => {
    dispatch(fetchOrganizations(clientId));
    commonService.getCountries().then(setCountries).catch(console.error);
  }, [dispatch, clientId]);

  // Show success toast and auto-close modal
  useEffect(() => {
    if (success && message) {
      toastService.success(message);
      setModalOpen(false);
      setTimeout(() => dispatch(resetOrganizationState()), 3000);
    }
  }, [success, message, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toastService.error(error);
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  // Table columns 
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
        header: "Address",
        accessorKey: "address_Line1",
        enableSorting: false,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "City",
        accessorKey: "city",
        enableSorting: true,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "State",
        accessorKey: "state",
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
            <Badge color={isActive ? "success" : "secondary"} className="font-size-12">
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
          const row: OrganizationListItem = cell.row.original;
          return (
            <div className="d-flex gap-2">
              <Button color="primary" size="sm" outline onClick={() => handleEdit(row)}>
                <i className="mdi mdi-pencil" />
              </Button>
              <Button color="danger" size="sm" outline onClick={() => handleDeleteOpen(row.id)}>
                <i className="mdi mdi-trash-can-outline" />
              </Button>
            </div>
          );
        },
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Handlers 

  const handleAddNew = () => {
    dispatch(setSelected(null));
    setForm(emptyModel(clientId));
    setFormErrors({});
    setStates([]);
    setCities([]);
    setModalOpen(true);
  };

  const handleEdit = async (row: OrganizationListItem) => {
    const model = toModel(row);
    dispatch(setSelected(model));
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
    dispatch(setSelected(null));
  };

  const handleDeleteOpen = (id: number) => {
    setDeleteTarget(id);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget !== null) {
      dispatch(removeOrganization(deleteTarget));
    }
    setDeleteModal(false);
    setDeleteTarget(null);
  };

  // set values of dropdown
  const selectedCountry = useMemo(
    () => countryOptions.find(o => o.value === form.countryId) ?? null,
    [countryOptions, form.countryId]
  );

  const selectedState = useMemo(
    () => stateOptions.find(o => o.value === form.stateId) ?? null,
    [stateOptions, form.stateId]
  );

  const selectedCity = useMemo(
    () => cityOptions.find(o => o.value === form.cityId) ?? null,
    [cityOptions, form.cityId]
  );  

  // Form field handlers

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Country → load states, reset state & city
  const handleCountryChange = async (option: SingleValue<SelectOption>) => {
    const countryId = option?.value ?? null;
    setForm(prev => ({ ...prev, countryId, stateId: null, cityId: null }));
    setStates([]);
    setCities([]);
    if (countryId) {
      setLoadingStates(true);
      try {
        const data = await commonService.getStates(countryId);
        setStates(data);
      } catch { /* ignore */ } finally {
        setLoadingStates(false);
      }
    }
  };

  // State → load cities, reset city
  const handleStateChange = async (option: SingleValue<SelectOption>) => {
    const stateId = option?.value ?? null;
    setForm(prev => ({ ...prev, stateId, cityId: null }));
    setCities([]);
    if (stateId) {
      setLoadingCities(true);
      try {
        const data = await commonService.getCities(stateId);
        setCities(data);
      } catch { /* ignore */ } finally {
        setLoadingCities(false);
      }
    }
  };

  // City
  const handleCityChange = (option: SingleValue<SelectOption>) => {
    setForm(prev => ({ ...prev, cityId: option?.value ?? null }));
  };

  // Validation

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name?.trim())     errors.name     = "Name is required";
    if (!form.contact1?.trim()) errors.contact1 = "Contact is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(saveOrganization(form, clientId));
  };

  // Render─────────────────────

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Admin" breadcrumbItem="Organizations" />

          <Row>
            <Col xs={12}>
              <Card>
                <CardBody>
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                    </div>
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={list}
                      isGlobalFilter
                      isAddButton
                      isPagination
                      isCustomPageSize
                      handleUserClick={handleAddNew}
                      buttonClass="btn btn-info btn-rounded"
                      buttonName=" + Add"
                      searchPlaceholder="Search organizations..."
                      tableClass="table-bordered align-middle nowrap mt-2"
                      theadClass="table-light"
                      paginationWrapper="dataTables_paginate paging_simple_numbers"
                      pagination="pagination justify-content-end pagination-sm"
                    />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Add / Edit Modal───*/}
      <Modal isOpen={modalOpen} toggle={handleModalClose} size="lg" centered className="org-modal">
        <ModalHeader toggle={handleModalClose}>
          {form.id === 0 ? "Add Organization" : "Edit Organization"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>

            {/* Code / Name */}
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for="code">Code</Label>
                  <Input
                    id="code" name="code"
                    value={form.code ?? ""}
                    onChange={handleChange}
                    placeholder="ORG-001"
                  />
                </FormGroup>
              </Col>
              <Col md={8}>
                <FormGroup>
                  <Label for="name">Name <span className="text-danger">*</span></Label>
                  <Input
                    id="name" name="name"
                    value={form.name ?? ""}
                    onChange={handleChange}
                    invalid={!!formErrors.name}
                    placeholder="Organization name"
                  />
                  <FormFeedback>{formErrors.name}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>

            {/* Address */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1" name="addressLine1"
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
                    id="addressLine2" name="addressLine2"
                    value={form.addressLine2 ?? ""}
                    onChange={handleChange}
                    placeholder="Suite, floor, etc."
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Country / State / City */}
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Country</Label>
                  <CreatableSelect<SelectOption>
                    inputId="countryId"
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    placeholder="Search country..."
                    isClearable
                    menuPlacement="auto"
                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>
                    State {loadingStates && <Spinner size="sm" className="ms-1" />}
                  </Label>
                  <CreatableSelect<SelectOption>
                    inputId="stateId"
                    options={stateOptions}
                    value={selectedState}
                    onChange={handleStateChange}
                    placeholder={form.countryId ? "Search state..." : "Select country first"}
                    isClearable
                    isDisabled={!form.countryId || loadingStates}
                    isLoading={loadingStates}
                    menuPlacement="auto"
                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>
                    City {loadingCities && <Spinner size="sm" className="ms-1" />}
                  </Label>
                  <CreatableSelect<SelectOption>
                    inputId="cityId"
                    options={cityOptions}
                    value={selectedCity}
                    onChange={handleCityChange}
                    placeholder={form.stateId ? "Search city..." : "Select state first"}
                    isClearable
                    isDisabled={!form.stateId || loadingCities}
                    isLoading={loadingCities}
                    menuPlacement="auto"
                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Zip / Contacts */}
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for="zip">Zip / Postal Code</Label>
                  <Input
                    id="zip" name="zip"
                    value={form.zip ?? ""}
                    onChange={handleChange}
                    placeholder="12345"
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="contact1">Contact 1 <span className="text-danger">*</span></Label>
                  <Input
                    id="contact1" name="contact1"
                    value={form.contact1 ?? ""}
                    onChange={handleChange}
                    invalid={!!formErrors.contact1}
                    placeholder="Phone or email"
                  />
                  <FormFeedback>{formErrors.contact1}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="contact2">Contact 2</Label>
                  <Input
                    id="contact2" name="contact2"
                    value={form.contact2 ?? ""}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Active */}
            <Row>
              <Col md={12}>
                <FormGroup check className="mt-1">
                  <Input
                    id="active" name="active"
                    type="checkbox"
                    checked={form.active ?? true}
                    onChange={handleChange}
                  />
                  <Label for="active" check className="ms-2">Active</Label>
                </FormGroup>
              </Col>
            </Row>

          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline onClick={handleModalClose} disabled={saving}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={saving}>
              {saving
                ? <><Spinner size="sm" className="me-1" />Saving...</>
                : form.id === 0 ? "Add Organization" : "Save Changes"
              }
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

export default OrganizationList;
