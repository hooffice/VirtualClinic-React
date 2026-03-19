import React from "react";
import { Link } from "react-router-dom";

const AdminMenu = (props: any) => {
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
          <li>
            <Link to="#">{props.t("Saas")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Blog")}</Link>
          </li>
        </ul>
      </li>

      <li className="menu-title">{props.t("Management")}</li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-user"></i>
          <span>{props.t("Users")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("All Users")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Add User")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("User Roles")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-cog"></i>
          <span>{props.t("Settings")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("General Settings")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Security")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Permissions")}</Link>
          </li>
        </ul>
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

export default AdminMenu;
