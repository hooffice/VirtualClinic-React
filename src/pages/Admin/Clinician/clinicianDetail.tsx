import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  fetchClinicianByClinicianId,
  saveClinician,
} from "@/slices/admin/clinician/clinicianThunk";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import classnames from "classnames";
import ClinicianClinic from "./clinicianClinic";
import ClinicianProfile from "./clinicianProfile";
import {
  ClinicianForm,
  clinicianSchema,
} from "@/types/admin/clinician/clinician.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emptyForm, toForm, toModel } from "@/types/admin/clinician/clinician.mapper";
import { setSelected } from "@/slices/admin/organization/reducer";
import { RHFFormWrapper } from "@/Components/Common/Forms";

const ClinicianDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const clientId = Number(import.meta.env.VITE_CLIENT_ID) || 1;
  const [initialized, setInitialized] = useState(false);

  const { selected, loading, error } = useSelector(
    (state: RootState) => state.Clinician,
  );

  const isAddMode = !id || id === "0";

  //Tabs
  const [activeTab, setactiveTab] = useState("1");
  const toggle = (tab: any) => {
    if (activeTab !== tab) {
      setactiveTab(tab);
    }
  };
  const methods = useForm<ClinicianForm>({
    resolver: zodResolver(clinicianSchema),
    defaultValues: emptyForm(clientId),
  });

  const { reset, handleSubmit } = methods;

  const onSubmit = async (formData: ClinicianForm) => {
    console.log("FULL FORM DATA:", formData);
    const payload = toModel(formData);
    await dispatch(saveClinician(payload, clientId));
  };

  const handleCancel = () => {
    navigate("/admin/clinician");
  };

  // Fetch clinician data if editing (id > 0)
  useEffect(() => {
    if (isAddMode) {
      dispatch(setSelected(null));
      const emptyData = emptyForm(clientId);
      reset(emptyData);
      setInitialized(true);
    } else if (id) {
      // Reset initialized flag when id changes so form updates
      setInitialized(false);
      dispatch(fetchClinicianByClinicianId(Number(id)));
      setInitialized(true);
    }
  }, [id, isAddMode, dispatch, reset, clientId]);

  // Update form when selected clinician data arrives
  useEffect(() => {
    if (selected && !isAddMode) {
      reset(toForm(selected));
    }
  }, [selected, isAddMode, reset]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            pageTitle="Clinician Information"
            title="Admin"
            items={[
              { label: "Clinicians", path: "/admin/clinician" },
              { label: isAddMode ? "Add" : "Edit", active: true },
            ]}
          />
          <Row>
            <Col xs={12}>
              <RHFFormWrapper methods = {methods} onSubmit={onSubmit}>
                  <Card>
                    <CardBody>
                      {loading && <div>Loading...</div>}
                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}
                      {!loading && (
                        <>
                          <Nav pills className="navtab-bg">
                            <NavItem>
                              <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({
                                  active: activeTab === "1",
                                })}
                                onClick={() => {
                                  toggle("1");
                                }}
                              >
                                <span className="d-block d-sm-none">
                                  <i className="far fa-user"></i>
                                </span>
                                <span className="d-none d-sm-block">
                                  <i className="far fa-user me-2"></i>
                                  Profile
                                </span>
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({
                                  active: activeTab === "2",
                                })}
                                onClick={() => {
                                  toggle("2");
                                }}
                              >
                                <span className="d-block d-sm-none">
                                  <i className="mdi mdi-hospital-building"></i>
                                </span>
                                <span className="d-none d-sm-block">
                                  <i className="mdi mdi-hospital-building me-2"></i>
                                  Clinics
                                </span>
                              </NavLink>
                            </NavItem>
                          </Nav>
                          <TabContent
                            activeTab={activeTab}
                            className="p-3 text-muted"
                          >
                            <TabPane tabId="1">
                              <Row>
                                <Col sm="12">
                                  <ClinicianProfile />
                                </Col>
                              </Row>
                            </TabPane>
                            <TabPane tabId="2">
                              <Row>
                                <Col sm="12">
                                  <ClinicianClinic />
                                </Col>
                              </Row>
                            </TabPane>
                          </TabContent>
                          {/* 🔹 COMMON BUTTONS */}
                          <div className="d-flex gap-2 mt-3">
                            <button type="submit" className="btn btn-primary">
                              Save
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>
              </RHFFormWrapper>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ClinicianDetail;
