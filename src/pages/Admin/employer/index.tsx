import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "@/services/toastService";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import { RootState } from "@/store";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer from "Components/Common/TableContainer";
import DeleteModal from "Components/Common/DeleteModal";
import {
  RHFInput,
  RHFCheckBox,
  RHFSelect,
  RHFFormWrapper,
} from "Components/Common/Forms";

//type
import { EmployerList } from "@/types/admin/employer/employer.type";
import {
  employerSchema,
  EmployerForm,
} from "@/types/admin/employer/employer.schema";
import { toForm, toModel } from "@/types/admin/employer/employer.mapper";
//thunk
import {
  fetchEmployers,
  saveEmployer,
  removeEmployer,
} from "@/slices/admin/employer/employerThunk";
//slice-reducre
import {
  setSelected,
  resetEmployerState,
  clearError,
} from "@/slices/admin/employer/employerSlice";
//service
import { organizationService } from "@/services/admin/organization/organizationService";
import { OrganizationListItem } from "@/types/admin/organization/organization.type";

// Helpers ─ Models
const emptyModel = (clientId: number): EmployerForm => ({
  id: 0,
  clientId,
  organizationId: null,
  code: "",
  name: "",
  active: true,
});

// Map list row → form data
const listToForm = (item: EmployerList): EmployerForm =>
  toForm({
    id: item.id,
    clientId: item.clientId,
    organizationId: item.organizationId ? Number(item.organizationId) : null,
    code: item.code ?? "",
    name: item.name ?? "",
    active: item.active === "Yes" ? true : false,
  });

// component - rafcep

const Employers: React.FC = () => {
  document.title = "Employers | Virtual Clinic";

  const dispatch = useDispatch<any>();
  const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;

  // Redux State
  const { list, loading, saving, success, error, message } = useSelector(
    (state: RootState) => state.Employer,
  );

  // React Hook Form with Zod validation
  const methods = useForm<EmployerForm>({
    resolver: zodResolver(employerSchema),
    mode: "onBlur",
    defaultValues: emptyModel(clientId),
  });
  const {
    setError,
    formState: { errors },
  } = methods;
  // Local UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>(
    [],
  );
  const [editingRow, setEditingRow] = useState<EmployerList | null>(null);

  // react-select options (memoized)
  const organizationOptions = useMemo(
    () =>
      organizations.map((c) => ({ value: Number(c.id), label: c.name ?? "" })),
    [organizations],
  );

  // Handlers
  const handleAddNew = () => {
    dispatch(setSelected(null));
    methods.reset(emptyModel(clientId));
    setModalOpen(true);
  };

  const handleEdit = async (row: EmployerList) => {
    const model = toModel(listToForm(row));
    dispatch(setSelected(model));
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingRow(null);
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

  // Form Submit with React Hook Form
  const onSubmit = (formData: EmployerForm) => {
    if (!formData.organizationId) {
      setError("organizationId", {
        type: "manual",
        message: "Organization is required",
      });
      return;
    }
    const model = toModel(formData);
    dispatch(saveEmployer(model, clientId));
  };

  // Handle form population when editing
  useEffect(() => {
    if (modalOpen) {
      if (editingRow) {
        methods.reset(listToForm(editingRow));
      } else {
        methods.reset(emptyModel(clientId));
      }
    }
  }, [modalOpen, editingRow, methods, clientId]);
  // Load list + dropdown on mount
  useEffect(() => {
    dispatch(fetchEmployers(clientId));
    organizationService
      .getByClientId(clientId)
      .then((res) => {
        setOrganizations(res.data);
      })
      .catch(console.error);
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
          const row: EmployerList = cell.row.original;
          return (
            <div className="d-flex gap-2">
              <Button
                color="primary"
                size="sm"
                outline
                onClick={() => handleEdit(row)}
              >
                <i className="mdi mdi-pencil" />
              </Button>
              <Button
                color="danger"
                size="sm"
                outline
                onClick={() => handleDeleteOpen(row.id)}
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
                    headerStyle={{ fontSize: "11px", fontWeight: 600 }}
                    rowStyle={{ fontSize: "10px" }}                  
                    columns={columns}
                    data={list || []}
                    isGlobalFilter
                    isAddButton
                    isPagination
                    isCustomPageSize
                    isLoading={loading}
                    // isRowClickable={true}
                    // onRowClick={(row)=>{console.log(row)}}
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

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} toggle={handleModalClose} size="lg" centered>
        <ModalHeader toggle={handleModalClose}>
          {methods.getValues("id") === 0 ? "Add Employer" : "Edit Employer"}
        </ModalHeader>

        <RHFFormWrapper methods={methods} onSubmit={onSubmit}>
          <ModalBody
            style={{ maxHeight: "calc(90vh - 180px)", overflowY: "auto" }}
          >
            <Row>
              <Col md={12}>
                <RHFSelect<EmployerForm>
                  name="organizationId"
                  label="Organization"
                  options={organizationOptions}
                  isClearable
                />
                {errors.organizationId && (
                  <span className="text-danger">
                    {errors.organizationId.message}
                  </span>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <RHFInput<EmployerForm>
                  name="code"
                  label="Code"
                  placeholder="EMP-001"
                  type="text"
                />
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <RHFInput<EmployerForm>
                  name="name"
                  label="Name"
                  placeholder="Employer name"
                  type="text"
                />
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <RHFCheckBox<EmployerForm> name="active" label="Active" />
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
              ) : methods.getValues("id") === 0 ? (
                "Add Employer"
              ) : (
                "Save Changes"
              )}
            </Button>
          </ModalFooter>
        </RHFFormWrapper>
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
