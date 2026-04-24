import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
import { ClinicModel, ClinicListItem } from "@/types/clinic.types";
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

/**
 * Clinic Component with Server-Side Pagination & Search
 * Uses TableContainer with server-side data fetching
 */

const emptyModel: ClinicModel = {
  id: 0,
  clientId: 1,
  organizationId: 0,
  code: null,
  name: null,
  addressLine1: null,
  addressLine2: null,
  cityId: null,
  cityName: null,
  stateId: null,
  stateName: null,
  countryId: null,
  countryName: null,
  zip: null,
  contact1: null,
  contact2: null,
  active: true,
  timezone: null,
};

const ClinicList: React.FC = () => {
  document.title = "Clinics | Virtual Clinic";

  const dispatch = useDispatch<any>();
  const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;

  // Redux state
  const { list, loading, saving, success, error, message, totalPages, currentPage, pageSize, totalRecords } = useSelector(
    (state: RootState) => state.Clinic
  );

  // Local UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [form, setForm] = useState<ClinicModel>(emptyModel);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Server-side pagination & search state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageNum, setPageNum] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Ref to track last fetched query to prevent duplicate calls
  const lastQueryRef = useRef<string>("");

  // Handle server-side query changes from TableContainer
  // No memoization needed - state updates are the priority here
  const handleServerChange = (query: any) => {
    console.log("📌 handleServerChange called with:", query);

    if (query.page !== undefined) {
      setPageNumber(query.page);
      console.log("✓ setPageNumber to:", query.page);
    }
    if (query.pageSize !== undefined) {
      setPageNum(query.pageSize);
      console.log("✓ setPageNum to:", query.pageSize);
    }
    if (query.search !== undefined) {
      setSearchTerm(query.search);
      console.log("✓ setSearchTerm to:", query.search);
    }
  };

  // Fetch clinics when page, size, or search changes
  // Use ref to prevent duplicate fetches in strict mode or from loops
  useEffect(() => {
    const currentQuery = JSON.stringify({
      clientId,
      pageNumber,
      pageSize: pageNum,
      search: searchTerm,
    });

    console.log("📌 Fetch useEffect triggered. Query:", currentQuery);

    if (lastQueryRef.current === currentQuery) {
      console.log("⏭️  Skipped (duplicate query)");
      return;
    }

    console.log("📡 Fetching data. Previous query:", lastQueryRef.current);
    lastQueryRef.current = currentQuery;

    dispatch(fetchClinics({
      clientId,
      pageNumber,
      pageSize: pageNum,
      search: searchTerm,
    }));

  }, [pageNumber, pageNum, searchTerm, clientId, dispatch]);

  // Show success toast and close modal (only after save/delete, not after pagination)
  useEffect(() => {
    if (success && message) {
      toastService.success(message);
      setModalOpen(false);
      // Reset form only on success
      setForm(emptyModel);
      setFormErrors({});

      // Reset to page 1 - will trigger fetch via main useEffect
      setPageNumber(1);
      setPageNum(10);
      setSearchTerm("");

      // Update ref to ensure we fetch page 1 (not skipped by duplicate check)
      lastQueryRef.current = "";

      // Clear success state after a delay
      const timer = setTimeout(() => {
        dispatch(resetClinicState());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, message, dispatch]);

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
        header: "Address",
        accessorKey: "address_Line1",
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
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Handlers
  const handleAddNew = () => {
    dispatch(setSelected(null));
    setForm(emptyModel);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = (clinic: ClinicListItem) => {
    const model: ClinicModel = {
      id: clinic.id,
      clientId: clinic.client_Id || clientId,
      organizationId: clinic.organization_Id || 0,
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
      timezone: null,
    };
    dispatch(setSelected(model));
    setForm(model);
    setFormErrors({});
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
    if (!form.code?.trim()) errors.code = "Code is required";
    if (!form.contact1?.trim()) errors.contact1 = "Contact is required";
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
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <p className="text-muted mt-2">Loading clinics...</p>
                    </div>
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={list || []}
                      isGlobalFilter
                      isAddButton
                      isPagination
                      isCustomPageSize
                      handleUserClick={handleAddNew}
                      buttonClass="btn btn-info btn-rounded"
                      buttonName="Add Clinic"
                      // Server-side pagination props
                      isServerSidePagination={true}
                      onServerChange={handleServerChange}
                      serverSideTotalRecords={totalRecords}
                      serverSideCurrentPage={currentPage}
                      serverSidePageSize={pageSize}
                      serverSideTotalPages={totalPages}
                      serverSideSearchTerm={searchTerm}
                    />
                  )}
                  <Row>
                  {/* Pagination Info */}
                  <Col xs={12} className="text-center">
                      {loading == false && totalPages > 0 && (
                            <small className="text-muted">
                              Showing <strong>{Math.min(currentPage * pageSize, totalRecords)}</strong> of <strong>{totalRecords}</strong> 
                            </small>
                      )}
                  </Col>
                </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
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
                  <Label for="code">
                    Code <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={form.code ?? ""}
                    onChange={handleChange}
                    invalid={!!formErrors.code}
                    placeholder="CLINIC-001"
                  />
                  {formErrors.code && (
                    <span className="text-danger small">{formErrors.code}</span>
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

            {/* City / State */}
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="cityName">City</Label>
                  <Input
                    id="cityName"
                    name="cityName"
                    value={form.cityName ?? ""}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="stateName">State</Label>
                  <Input
                    id="stateName"
                    name="stateName"
                    value={form.stateName ?? ""}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Zip / Country */}
            <Row>
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
              <Col md={6}>
                <FormGroup>
                  <Label for="countryName">Country</Label>
                  <Input
                    id="countryName"
                    name="countryName"
                    value={form.countryName ?? ""}
                    onChange={handleChange}
                    placeholder="Country"
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
                    <span className="text-danger small">{formErrors.contact1}</span>
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
                  <Label for="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    value={form.timezone ?? ""}
                    onChange={handleChange}
                    placeholder="UTC, EST, etc."
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
            <Button color="secondary" outline onClick={handleModalClose} disabled={saving}>
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

      {/* ── Delete Confirmation ──────────────────────────────────────────── */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteConfirm}
        onCloseClick={() => setDeleteModal(false)}
      />
    </React.Fragment>
  );
};

export default ClinicList;
