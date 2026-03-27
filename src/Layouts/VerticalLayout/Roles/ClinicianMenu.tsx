//import React from "react";
import { Link } from "react-router-dom";

const ClinicianMenu = (props: any) => {
  return (
    <>
      <li className="menu-title">{props.t("Menu")} </li>
      <li>
        <Link to="/#" className="has-arrow">
          <i className="bx bx-home-circle"></i>
          <span>{props.t("Dashboards")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="/dashboard">{props.t("Default")}</Link>
          </li>
        </ul>
      </li>

      <li className="menu-title">{props.t("Clinical")}</li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-stethoscope"></i>
          <span>{props.t("Patients")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("My Patients")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Patient Records")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Appointments")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-file-blank"></i>
          <span>{props.t("Medical Records")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("Prescriptions")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Test Results")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Diagnoses")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-calendar"></i>
          <span>{props.t("Schedule")}</span>
        </Link>
      </li>
    </>
  );
};

export default ClinicianMenu;
