import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastService } from "@/services/toastService";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Badge,
} from "reactstrap";
import { RootState } from "@/store";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer from "Components/Common/TableContainer";
import avatar1 from  "@/assets/images/users/avatar-1.jpg" //"../../assets/images/users/avatar-3.jpg"
//type
import { ClinicianList } from "@/types/admin/clinician/clinician.types";
//thunk
import { fetchCliniciansList } from "@/slices/admin/clinician/clinicianThunk";
//reducer
import { clearError } from "@/slices/admin/clinician/clinicianSlice";

const Clinician: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const clientId: number = Number(import.meta.env.VITE_CLIENT_ID) || 1;
  const baseurl: string = import.meta.env.VITE_API_BASE_URL;

  // Redux state
  const {
    list,
    loading,
    error,
    totalPages,
    currentPage,
    pageSize,
    totalRecords,
  } = useSelector((state: RootState) => state.Clinician);

  // Server-side pagination & search state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize_Local, setPageSize_Local] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");


  // Initial fetch on mount
  useEffect(() => {
    dispatch(
      fetchCliniciansList({
        clientId,
        pageNumber: 1,
        pageSize: 10,
        search: "",
      })
    );
  }, [clientId, dispatch]);

  // Fetch when pagination/search changes
  useEffect(() => {
    dispatch(
      fetchCliniciansList({
        clientId,
        pageNumber,
        pageSize: pageSize_Local,
        search: searchTerm,
      })
    );
  }, [pageNumber, pageSize_Local, searchTerm, clientId, dispatch]);

  // Handle server-side query changes
  const handleServerChange = (query: any) => {
    if (query.page !== undefined) {
      setPageNumber(query.page);
    }
    if (query.pageSize !== undefined) {
      setPageSize_Local(query.pageSize);
    }
    if (query.search !== undefined) {
      setSearchTerm(query.search);
    }
  };


  // Handle row click - navigate to edit
  const handleRowClick = (row: ClinicianList) => {
    navigate(`/admin/clinician/${row.id}`);
  };

  // Handle Add New button
  const handleAddNew = () => {
    navigate("/admin/clinician/0");
  };

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
        header: "Profile",
        accessorKey: "profileImage",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell: any) => {
        const row = cell.row.original;
        const img = baseurl + row.profileImage;

        return (
          <img
            src={img || avatar1} 
            alt="profile"
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        );
      },        
      },
      {
        header: "First Name",
        accessorKey: "firstName",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Last Name",
        accessorKey: "lastName",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Primary Clinic",
        accessorKey: "primaryClinic",
        enableSorting: false,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "Affiliation",
        accessorKey: "affiliation",
        enableSorting: true,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "Contact",
        accessorKey: "primary_Contact",
        enableSorting: true,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      },
      {
        header: "Email",
        accessorKey: "primary_Email",
        enableSorting: true,
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
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Admin" breadcrumbItem="Clinicians"  />
          <Row>
            <Col xs={12}>
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={list || []}
                    isGlobalFilter
                    isPagination
                    isCustomPageSize
                    isLoading={loading}
                    isAddButton
                    handleUserClick={handleAddNew}
                    buttonClass="btn btn-info btn-rounded"
                    buttonName=" + Add"                    
                    isRowClickable={true}                      
                    onRowClick={(row)=>{handleRowClick(row)}}
                    searchPlaceholder="Search clinician..."
                    // Server-side pagination
                    isServerSidePagination={true}
                    onServerChange={handleServerChange}
                    serverSideTotalRecords={totalRecords}
                    serverSideCurrentPage={currentPage}
                    serverSidePageSize={pageSize}
                    serverSideTotalPages={totalPages}
                    serverSideSearchTerm={searchTerm}
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
    </React.Fragment>
  );
};

export default Clinician;
