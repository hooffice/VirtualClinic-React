//import React from "react";
import { Link } from "react-router-dom";

const AdminMenu = (props: any) => {
  return (
    <>
      <li className="menu-title">{props.t("Menu")} </li>
      <li>
        <Link to="/dashboard">
          <i className="bx bx-home-circle"></i>
          <span>{props.t("Dashboards")}</span>
        </Link>
      </li>

      <li className="menu-title">{props.t("Management")}</li>
      <li>
        <Link to="#" className="has-arrow">
          <i className="mdi mdi-adjust"></i>
          <span>{props.t("Setup")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="/admin/organization">{props.t("Organization")}</Link>
          </li>
          <li>
            <Link to="/admin/employer">{props.t("Employer")}</Link>
          </li>
          <li>
            <Link to="/admin/clinic">{props.t("Clinic")}</Link>
          </li>
          <li>
            <Link to="/admin/clinician">{props.t("Clinician")}</Link>
          </li> 
          <li>
            <Link to="#">{props.t("Patient")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Lab Test")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Medical Minute")}</Link>
          </li>   
          <li>
            <Link to="#">{props.t("Labcorp PSC Search")}</Link>
          </li>   
          <li>
            <Link to="#">{props.t("Stripe Download")}</Link>
          </li> 
          <li>
            <Link to="#">{props.t("Stripe to QuickBook Sync")}</Link>
          </li>                                             
        </ul>
                     
      </li>
      <li className="menu-title">{props.t("Analytics")}</li>
      <li>
        <Link to="#" className="has-arrow">
          <i className="bx bx-file"></i>
          <span>{props.t("Reports")}</span>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link to="#">{props.t("Lab Invoice")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Lab Order History")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("OHS Order History")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Order Summary")}</Link>
          </li> 
          <li>
            <Link to="#">{props.t("Refund")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Lab Invoice Verification")}</Link>
          </li>
          <li>
            <Link to="#">{props.t("Lab Results")}</Link>
          </li>   
          <li>
            <Link to="#">{props.t("Unprocessed Lab")}</Link>
          </li>   
          <li>
            <Link to="#">{props.t("Lab Review")}</Link>
          </li> 
          <li>
            <Link to="#">{props.t("Favourite Labs By Clinician")}</Link>
          </li>  
          <li>
            <Link to="#">{props.t("Sales Efforts")}</Link>
          </li>    
          <li>
            <Link to="#">{props.t("Sales Analysis")}</Link>
          </li>                                                              
        </ul>
                     
      </li>      
      {/* <li>
        <Link to="#">
          <i className="bx bx-file"></i>
          <span>{props.t("Reports")}</span>
        </Link>
      </li> */}
    </>
  );
};

export default AdminMenu;
