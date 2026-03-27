//import React from "react";
import { Link } from "react-router-dom";

const PatientMenu = (props: any) => {
  return (
    <>
      <li className="menu-title">{props.t("MENU")} </li>
      <li>
        <Link to="/dashboard">
          <i className="bx bx-home-circle"></i>
          <span>{props.t("Dashboard")}</span>
        </Link>
      </li>

      <li className="menu-title">{props.t("HEALTH")}</li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-heart"></i>
          <span>{props.t("My Health")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("Medical History")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Current Medications")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Allergies")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-calendar"></i>
          <span>{props.t("Appointments")}</span>
        </Link>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-receipt"></i>
          <span>{props.t("Test Results")}</span>
        </Link>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-file"></i>
          <span>{props.t("Prescriptions")}</span>
        </Link>
      </li>

      <li className="menu-title">{props.t("ACCOUNT")}</li>

      <li>
        <Link to="#">
          <i className="bx bx-user"></i>
          <span>{props.t("Profile")}</span>
        </Link>
      </li>
    </>
  );
};

export default PatientMenu;
