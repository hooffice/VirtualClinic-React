import { ReferralClinic } from "@/types/admin/clinic/clinic.types";
import {
  clinicianClinicSchema,
  ClinicianClinicForm,
} from "@/types/admin/clinician/referalclinic.schema";
import {
  emptyForm,
  toForm,
  toModel,
} from "@/types/admin/clinician/referalclinic.mapper";
import {
  fetchclinicianClinics,
  saveclinicianClinic,
  removeclinicianClinic,
} from "@/slices/admin/clinician/clinicianClinicThunk";
import {
  setSelected,
  resetClinicianClinicState,
  clearError,
} from "@/slices/admin/clinician/clinicianClinicSlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "@/services/toastService";
import { useEffect, useMemo, useState } from "react";
import {
  ClinicianClinicList,
  ClinicianClinicModel,
} from "@/types/admin/clinician/referalclinic.types";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from "reactstrap";
import clinicService from "@/services/admin/clinic/clinicService";
import React from "react";
import TableContainer from "@/Components/Common/TableContainer";
import {
  RHFCheckBox,
  RHFFormWrapper,
  RHFSelect,
} from "@/Components/Common/Forms";
import DeleteModal from "@/Components/Common/DeleteModal";

export const ClinicianClinic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();
  const clinicianId: number = Number(id);
  //const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;

  // Redux State
  const { list, loading, saving, success, error } = useSelector(
    (state: RootState) => state.ClinicianClinic,
  );

  // React Hook Form with Zod validation
  const methods = useForm<ClinicianClinicForm>({
    resolver: zodResolver(clinicianClinicSchema),
    mode: "onBlur",
    defaultValues: emptyForm(clinicianId),
  });
  const {} = methods;
  // Local UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [clinics, setClinics] = useState<ReferralClinic[]>([]);
  const [editingRow, setEditingRow] = useState<ClinicianClinicModel | null>(
    null,
  );

  // react-select options (memoized)
  const clinicOptions = useMemo(
    () => clinics.map((c) => ({ value: Number(c.id), label: c.name ?? "" })),
    [clinics],
  );

  // Handlers
  const handleAddNew = () => {
    dispatch(setSelected(null));
    methods.reset(emptyForm(clinicianId));
    setModalOpen(true);
  };

  const handleEdit = async (row: ClinicianClinicModel) => {
    const model = toModel(toForm(row));
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
      dispatch(removeclinicianClinic(deleteTarget, clinicianId));
    }
    setDeleteModal(false);
    setDeleteTarget(null);
  };

  // Form Submit with React Hook Form
  const onSubmit = (formData: ClinicianClinicForm) => {
    // Check if setting this clinic as primary
    if (formData.primary) {
      // Show warning if another clinic is already primary
      const anotherPrimaryExists = list?.some(
        (clinic) =>
          clinic.id !== formData.id &&
          (clinic.primary === true),
      );

      if (anotherPrimaryExists) {
        toastService.info(
          "Setting this clinic as primary. Previous primary clinic will be unset.",
        );
      }
    }

    const model = toModel(formData);
    dispatch(saveclinicianClinic(model, clinicianId));
  };

  // Handle form population when editing
  useEffect(() => {
    if (modalOpen) {
      if (editingRow) {
        methods.reset(toForm(editingRow));
      } else {
        methods.reset(emptyForm(clinicianId));
      }
    }
  }, [modalOpen, editingRow, methods, clinicianId]);

  // Load list + dropdown on mount
  useEffect(() => {
    dispatch(fetchclinicianClinics(clinicianId));
    clinicService
      .getReferralClinics(clinicianId)
      .then((res) => {
        setClinics(res.data);
      })
      .catch(console.error);
  }, [dispatch, clinicianId]);

  // Auto-close modal on success
  useEffect(() => {
    if (success) {
      setModalOpen(false);
      setTimeout(() => dispatch(resetClinicianClinicState()), 3000);
    }
  }, [success, dispatch]);

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
        header: "Clinic",
        accessorKey: "clinicName",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Primary",
        accessorKey: "primary",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell: any) => {
          const val = cell.getValue();
          const isActive = val === true || val === "1";
          return (
            <Badge
              color={isActive ? "success" : "secondary"}
              className="font-size-12"
            >
              {isActive ? "Yes" : "No"}
            </Badge>
          );
        },
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
          const row: ClinicianClinicList = cell.row.original;
          const isPrimary = row.primary === true;
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
              {list && list.length > 1 && !isPrimary && (
                <Button
                  color="danger"
                  size="sm"
                  outline
                  onClick={() => handleDeleteOpen(row.id)}
                >
                  <i className="mdi mdi-trash-can-outline" />
                </Button>
              )}
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
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <TableContainer
                headerStyle={{ fontSize: "11px", fontWeight: 600 }}
                rowStyle={{ fontSize: "10px" }}
                columns={columns}
                data={list || []}
                isGlobalFilter={false}
                isAddButton
                isPagination={false}
                isLoading={loading}
                handleUserClick={handleAddNew}
                buttonClass="btn btn-info btn-rounded"
                buttonName=" + Add"
                tableClass="table-bordered align-middle nowrap mt-2"
                theadClass="table-light"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} toggle={handleModalClose} size="lg" centered>
        <ModalHeader toggle={handleModalClose}>
          {methods.getValues("id") === 0 ? "Add Clinic" : "Edit Clinic"}
        </ModalHeader>

        <RHFFormWrapper methods={methods} onSubmit={onSubmit}>
          <ModalBody
            style={{ maxHeight: "calc(90vh - 180px)", overflowY: "auto" }}
          >
            <Row>
              <Col sm={12}>
                <RHFSelect<ClinicianClinicForm>
                  name="clinicId"
                  label="Clinic"
                  options={clinicOptions}
                  isClearable
                />
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <RHFCheckBox<ClinicianClinicForm>
                  name="primary"
                  label="Primary"
                />
              </Col>
              <Col sm={6}>
                <RHFCheckBox<ClinicianClinicForm>
                  name="active"
                  label="Active"
                />
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
                "Add Clinic"
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

export default ClinicianClinic;
