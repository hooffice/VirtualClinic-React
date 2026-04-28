import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchClinicianByClinicianId } from "@/slices/admin/clinician/clinicianThunk";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  TabContent,
  TabPane,
  CardText,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import classnames from "classnames";

const ClinicianDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const clientId = Number(import.meta.env.VITE_CLIENT_ID) || 1;

  const { selected, loading, error } = useSelector(
    (state: RootState) => state.Clinician,
  );

  const isAddMode = id === "0";

  //Temp
  const [activeTab1, setactiveTab1] = useState("1");
  const toggle1 = (tab: any) => {
    if (activeTab1 !== tab) {
      setactiveTab1(tab);
    }
  };
  // Fetch clinician data if editing (id > 0)
  useEffect(() => {
    if (!isAddMode && id) {
      dispatch(fetchClinicianByClinicianId(Number(id)));
    }
  }, [id, dispatch, isAddMode]);

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
              <Card>
                <CardBody>
                  {loading && <div>Loading...</div>}
                  {error && <div className="alert alert-danger">{error}</div>}
                  {!loading && (
                    <>
                      <Nav pills className="navtab-bg">
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: activeTab1 === "5",
                            })}
                            onClick={() => {
                              toggle1("5");
                            }}
                          >
                            <span className="d-block d-sm-none">
                              <i className="fas fa-home"></i>
                            </span>
                            <span className="d-none d-sm-block">Home</span>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: activeTab1 === "6",
                            })}
                            onClick={() => {
                              toggle1("6");
                            }}
                          >
                            <span className="d-block d-sm-none">
                              <i className="far fa-user"></i>
                            </span>
                            <span className="d-none d-sm-block">Profile</span>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: activeTab1 === "7",
                            })}
                            onClick={() => {
                              toggle1("7");
                            }}
                          >
                            <span className="d-block d-sm-none">
                              <i className="far fa-envelope"></i>
                            </span>
                            <span className="d-none d-sm-block">Messages</span>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: activeTab1 === "8",
                            })}
                            onClick={() => {
                              toggle1("8");
                            }}
                          >
                            <span className="d-block d-sm-none">
                              <i className="fas fa-cog"></i>
                            </span>
                            <span className="d-none d-sm-block">Settings</span>
                          </NavLink>
                        </NavItem>
                      </Nav>
                      <TabContent
                        activeTab={activeTab1}
                        className="p-3 text-muted"
                      >
                        <TabPane tabId="1">
                          <Row>
                            <Col sm="12">
                              <CardText className="mb-0">
                                Raw denim you probably haven&apos;t heard of
                                them jean shorts Austin. Nesciunt tofu stumptown
                                aliqua, retro synth master cleanse. Mustache
                                cliche tempor, williamsburg carles vegan
                                helvetica. Reprehenderit butcher retro keffiyeh
                                dreamcatcher synth. Cosby sweater eu banh mi,
                                qui irure terry richardson ex squid. Aliquip
                                placeat salvia cillum iphone. Seitan aliquip
                                quis cardigan american apparel, butcher
                                voluptate nisi qui.
                              </CardText>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId="2">
                          <Row>
                            <Col sm="12">
                              <CardText className="mb-0">
                                Food truck fixie locavore, accusamus
                                mcsweeney&apos;s marfa nulla single-origin
                                coffee squid. Exercitation +1 labore velit, blog
                                sartorial PBR leggings next level wes anderson
                                artisan four loko farm-to-table craft beer twee.
                                Qui photo booth letterpress, commodo enim craft
                                beer mlkshk aliquip jean shorts ullamco ad vinyl
                                cillum PBR. Homo nostrud organic, assumenda
                                labore aesthetic magna delectus mollit. Keytar
                                helvetica VHS salvia yr, vero magna velit
                                sapiente labore stumptown. Vegan fanny pack odio
                                cillum wes anderson 8-bit.
                              </CardText>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId="3">
                          <Row>
                            <Col sm="12">
                              <CardText className="mb-0">
                                Etsy mixtape wayfarers, ethical wes anderson
                                tofu before they sold out mcsweeney&apos;s
                                organic lomo retro fanny pack lo-fi
                                farm-to-table readymade. Messenger bag gentrify
                                pitchfork tattooed craft beer, iphone skateboard
                                locavore carles etsy salvia banksy hoodie
                                helvetica. DIY synth PBR banksy irony. Leggings
                                gentrify squid 8-bit cred pitchfork.
                                Williamsburg banh mi whatever gluten-free,
                                carles pitchfork biodiesel fixie etsy retro
                                mlkshk vice blog. Scenester cred you probably
                                haven&apos;t heard of them, vinyl craft beer
                                blog stumptown. Pitchfork sustainable tofu synth
                                chambray yr.
                              </CardText>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId="4">
                          <Row>
                            <Col sm="12">
                              <CardText className="mb-0">
                                Trust fund seitan letterpress, keytar raw denim
                                keffiyeh etsy art party before they sold out
                                master cleanse gluten-free squid scenester
                                freegan cosby sweater. Fanny pack portland
                                seitan DIY, art party locavore wolf cliche high
                                life echo park Austin. Cred vinyl keffiyeh DIY
                                salvia PBR, banh mi before they sold out
                                farm-to-table VHS viral locavore cosby sweater.
                                Lomo wolf viral, mustache readymade thundercats
                                keffiyeh craft beer marfa ethical. Wolf salvia
                                freegan, sartorial keffiyeh echo park vegan.
                              </CardText>
                            </Col>
                          </Row>
                        </TabPane>
                      </TabContent>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ClinicianDetail;
