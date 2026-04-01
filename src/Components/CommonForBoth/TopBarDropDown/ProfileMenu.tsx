import React, { useState, useEffect } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

//i18n
import { withTranslation } from "react-i18next";
// Redux
import { Link } from "react-router-dom";
import withRouter from "../../Common/withRouter";
//import { createSelector } from 'reselect';

// users
import user1 from "../../../assets/images/users/avatar-1.jpg";

//import { useSelector } from "react-redux";
import { ENV } from "config/env";

const ProfileMenu = (props: any) => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);

  const [username, setUsername] = useState("Admin");
  const [avatarUrl, setAvatarUrl] = useState(user1);
  const [userInitials, setUserInitials] = useState("A");

  // const selectProfileProperties = createSelector(
  //   (state: any) => state.Profile,
  //   (profile) => ({
  //     user: profile.user,
  //   })
  // );

  // const { user } = useSelector(selectProfileProperties);


  useEffect(() => {
    const authUserStr = localStorage.getItem("authUser");
    const userProfileStr = localStorage.getItem("userProfile");

    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr);
        let displayEmail = "";

        // Display email from authUser
        if (authUser.userName) {
          setUsername(authUser.userName);
          displayEmail = authUser.userName;
        }

        // Generate initials from email/name
        if (displayEmail) {
          const initial = displayEmail.charAt(0).toUpperCase();
          setUserInitials(initial);
        }

        // Check for profile picture in authUser
        if (authUser.profilePicture || authUser.profilePictureUrl || authUser.avatar) {
          setAvatarUrl(authUser.profilePicture || authUser.profilePictureUrl || authUser.avatar);
        }
      } catch (error) {
        console.error('[ProfileMenu] Error parsing authUser:', error);
      }
    }

    // Also check userProfile for additional avatar info
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile.profilePicture || userProfile.profilePictureUrl || userProfile.avatar) {
          setAvatarUrl(userProfile.profilePicture || userProfile.profilePictureUrl || userProfile.avatar);
        }
      } catch (error) {
        console.error('[ProfileMenu] Error parsing userProfile:', error);
      }
    }
  }, []);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item"
          id="page-header-user-dropdown"
          tag="button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {avatarUrl && avatarUrl !== user1 ? (
            <img
              className="rounded-circle header-profile-user"
              src={avatarUrl}
              alt="User Avatar"
              style={{
                width: "32px",
                height: "32px",
                flexShrink: 0,
              }}
              onError={(e) => {
                // Fallback to default if image fails to load
                e.currentTarget.src = user1;
              }}
            />
          ) : (
            <div
              className="rounded-circle header-profile-user d-flex align-items-center justify-content-center"
              style={{
                width: "32px",
                height: "32px",
                minWidth: "32px",
                backgroundColor: "#667eea",
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
          )}
          <span className="d-none d-xl-inline-block ms-0" style={{ whiteSpace: "nowrap" }}>
            {username || "admin"}
          </span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" style={{ marginLeft: "4px" }} />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag="a" href={ENV.PUBLIC_URL + "/profile"}>
            {" "}
            <i className="bx bx-user font-size-16 align-middle me-1" />
            {props.t("Profile")}{" "}
          </DropdownItem>
          {/* <DropdownItem tag="a" href={ENV.PUBLIC_URL + "/crypto-wallet"}>
            <i className="bx bx-wallet font-size-16 align-middle me-1" />
            {props.t("My Wallet")}
          </DropdownItem>
          <DropdownItem tag="a" href="#">
            <span className="badge bg-success float-end">11</span>
            <i className="bx bx-wrench font-size-16 align-middle me-1" />
            {props.t("Settings")}
          </DropdownItem>
          <DropdownItem tag="a" href={ENV.PUBLIC_URL + "/auth-lock-screen"}>
            <i className="bx bx-lock-open font-size-16 align-middle me-1" />
            {props.t("Lock screen")}
          </DropdownItem> */}
          <div className="dropdown-divider" />
          <Link to="/logout" className="dropdown-item">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </Link>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default withRouter(withTranslation()(ProfileMenu));