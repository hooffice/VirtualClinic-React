import React from "react";
import { Link } from "react-router-dom";

const SubAdminMenu = (props: any) => {
  return (
    <>
      <li className="menu-title">{props.t("MENU")} </li>
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

      <li className="menu-title">{props.t("MANAGEMENT")}</li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-user"></i>
          <span>{props.t("Clinicians")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("All Clinicians")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Add Clinician")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Departments")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-user-plus"></i>
          <span>{props.t("Patients")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("All Patients")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Add Patient")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-briefcase"></i>
          <span>{props.t("Departments")}</span>
        </Link>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-file"></i>
          <span>{props.t("Reports")}</span>
        </Link>
      </li>
    </>
  );
};

export default SubAdminMenu;
