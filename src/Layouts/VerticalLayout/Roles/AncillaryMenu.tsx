import React from "react";
import { Link } from "react-router-dom";

const AncillaryMenu = (props: any) => {
  return (
    <>
      <li className="menu-title">{props.t("MENU")} </li>
      <li>
        <Link to="/dashboard">
          <i className="bx bx-home-circle"></i>
          <span>{props.t("Dashboard")}</span>
        </Link>
      </li>

      <li className="menu-title">{props.t("SUPPORT")}</li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-task"></i>
          <span>{props.t("Tasks")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("My Tasks")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Completed")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("In Progress")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-test-tube"></i>
          <span>{props.t("Lab Work")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("Pending Tests")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Completed Tests")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Samples")}</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-chat"></i>
          <span>{props.t("Messages")}</span>
        </Link>
      </li>

      <li>
        <Link to="#">
          <i className="bx bx-receipt"></i>
          <span>{props.t("Schedule")}</span>
        </Link>
      </li>
    </>
  );
};

export default AncillaryMenu;
