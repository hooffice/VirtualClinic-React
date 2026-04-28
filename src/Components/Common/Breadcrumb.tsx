//import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, BreadcrumbItem } from "reactstrap";

const Breadcrumb = (props: any) => {
  return (
    <Row>
      <Col className="col-12">
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 className="mb-sm-0 font-size-18"> {props.pageTitle || props.breadcrumbItem}</h4>
          <div className="page-title-right">
            <ol className="breadcrumb m-0">
              <BreadcrumbItem>
                <Link to="#">{props.title}</Link>
              </BreadcrumbItem>
              {props.items
                ? props.items.map((item:any, index:any) => (
                    <BreadcrumbItem key={index} active={item.active}>
                      {item.path && !item.active ? (
                        <Link to={item.path}>{item.label}</Link>
                      ) : (
                        item.label
                      )}
                    </BreadcrumbItem>
                  ))
                : (
                  <BreadcrumbItem active>{props.breadcrumbItem}</BreadcrumbItem>
                )}              
              {/* <BreadcrumbItem active>{props.breadcrumbItem}</BreadcrumbItem> */}
            </ol>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Breadcrumb;
