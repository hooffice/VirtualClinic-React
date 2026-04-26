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
//dropdown
import CreatableSelect from "react-select/creatable";
import type { SingleValue } from "react-select";
//type
import { EmployerList, EmployerModel } from "@/types/admin/employer/employer.type";
//thunk
import { fetchEmployers, saveEmployer, removeEmployer } from "@/slices/admin/employer/employerThunk";
//slice-reducre
import { setSelected, resetEmployerState, clearError } from "@/slices/admin/employer/employerSlice";
//service
import { organizationService } from "@/services/admin/organization/organizationService";
import { OrganizationListItem } from "@/types/admin/organization/organization.type";

// Types - Dropdown Listbox
type SelectOption = { value: number; label: string };

// Helpers ─ Models
const emptyModel = (clientId: number): EmployerModel =>({
    id: 0,
    clientId: clientId,
    organizationId: null,
    code:"",
    name:"",
    active:true
});

// Map list row → editable model
const toModel = (item: EmployerList): EmployerModel => ({
    id: item.id,
    clientId: item.clientId,
    organizationId: item.organizationId,
    code: item.code ?? "",
    name: item.name ?? "",
    active: item.active === 'Yes' ? true : false
});

// component - rafcep

const Employers: React.FC = () => {
  document.title = "Employers | Virtual Clinic";

  const dispatch = useDispatch<any>();
  const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;

 // Redux State
  const { list, loading, saving, success, error, message } = useSelector(
     (state: RootState) => state.Employer
   );

 // Local UI state
  const [modalOpen, setModalOpen]         = useState(false);
  const [deleteModal, setDeleteModal]     = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<number | null>(null);
  const [form, setForm]                   = useState<EmployerModel>(emptyModel(clientId));
  const [formErrors, setFormErrors]       = useState<Record<string, string>>({});
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);

  // react-select options (memoized)
  const organizationOptions = useMemo<SelectOption[]>(
    () =>
      organizations.map((c) => ({ value: Number(c.id), label: c.name ?? "" })),
    [organizations]
  );
  // set values of dropdown
  const selectedOrganization = useMemo(
    () =>
      organizationOptions.find((o) => o.value === form.organizationId) ?? null,
    [organizationOptions, form.organizationId]
  );

  // Dropdown - change value
  const handleOrganizationChange = (option: SingleValue<SelectOption>) => {
    setForm((prev) => ({ ...prev, organizationId: option?.value ?? 3 }));
  };

// Handlers 
  const handleAddNew = () => {
    dispatch(setSelected(null));
    setForm(emptyModel(clientId));
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (row: EmployerList) => {
    const model = toModel(row);
    dispatch(setSelected(model));
    setFormErrors({});
    setForm(model);
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
      dispatch(removeEmployer(deleteTarget));
    }
    setDeleteModal(false);
    setDeleteTarget(null);
  };

  // Form field handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Submit 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(saveEmployer(form, clientId));
  };


  // Form Validation 
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.code?.trim())     errors.code     = "Code is required";
    if (!form.name?.trim())     errors.name     = "Name is required";
    if (!form.organizationId?.toString().trim())
      errors.organizationId = "Organization is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load list + dropdown on mount
  useEffect(() => {
    dispatch(fetchEmployers(clientId));
    organizationService.getByClientId(clientId).then((res)=>{setOrganizations(res.data)}).catch(console.error);
  }, [dispatch, clientId]);  

  // Show success toast and auto-close modal
  useEffect(() => {
    if (success && message) {
      toastService.success(message);
      setModalOpen(false);
      setTimeout(() => dispatch(resetEmployerState()), 3000);
    }
  }, [success, message, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toastService.error(error);
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  //Create Table Object
  // Table columns declare
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
        accessorKey: "organization",
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
          const row: EmployerList = cell.row.original;
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


 // render

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Admin" breadcrumbItem="Employers" />

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
                      searchPlaceholder="Search employer..."
                      tableClass="table-bordered align-middle nowrap mt-2"
                      theadClass="table-light"
                      paginationWrapper="dataTables_paginate paging_simple_numbers"
                      pagination="pagination justify-content-end pagination-sm"
                    />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Add / Edit Modal───*/}
      <Modal isOpen={modalOpen} toggle={handleModalClose} size="lg" centered className="org-modal">
        <ModalHeader toggle={handleModalClose}>
          {form.id === 0 ? "Add Employer" : "Edit Employer"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            {/* Organization */}
            <Row>
              <Col md={12}>
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
            </Row>
            {/* Code */}
            <Row>
              <Col md={12}>
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
              </Row>
              {/*  Name */}
              <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="name">Name <span className="text-danger">*</span></Label>
                  <Input
                    id="name" name="name"
                    value={form.name ?? ""}
                    onChange={handleChange}
                    invalid={!!formErrors.name}
                    placeholder="Employer name"
                  />
                  <FormFeedback>{formErrors.name}</FormFeedback>
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
                : form.id === 0 ? "Add Employer" : "Save Changes"
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

export default Employers;