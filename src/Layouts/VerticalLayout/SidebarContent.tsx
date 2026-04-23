import React, { useEffect, useRef, useCallback, useState } from "react";
//Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";

//i18n
import { withTranslation } from "react-i18next";
import withRouter from "../../Components/Common/withRouter";
import { ENV } from "config/env";

// Role-based Menu Components
import AdminMenu from "./Roles/AdminMenu";
import ClinicianMenu from "./Roles/ClinicianMenu";
import PatientMenu from "./Roles/PatientMenu";
import AncillaryMenu from "./Roles/AncillaryMenu";
import SubAdminMenu from "./Roles/SubAdminMenu";

const SidebarContent = (props: any) => {
  const ref = useRef<any>();
  const metisMenuRef = useRef<any>(null);   // track instance so we can dispose it
  const [userType, setUserType] = useState<number | null>(null);

  // Get user type from localStorage userProfile
  useEffect(() => {
    const userProfileStr = localStorage.getItem('userProfile');
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        setUserType(userProfile.usertype || userProfile.utype);
      } catch (error) {
        console.error('[SidebarContent] Error parsing userProfile:', error);
        setUserType(null);
      }
    }
  }, []);

  // Function to render menu based on usertype from localStorage
  const renderMenuByRole = () => {
    const menuProps = { t: props.t };

    switch (userType) {
      case 3:
        // Clinician Menu
        return <ClinicianMenu {...menuProps} />;
      case 6:
        // Patient Menu
        return <PatientMenu {...menuProps} />;
      case 7:
        // Ancillary Staff Menu
        return <AncillaryMenu {...menuProps} />;
      case 1:
      case 4:
        // Admin Menu (for usertype 1 and 4)
        return <AdminMenu {...menuProps} />;
      default:
        // Default to SubAdminMenu or AdminMenu
        return <SubAdminMenu {...menuProps} />;
    }
  };

  const activateParentDropdown = useCallback((item: any) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items: any[]) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = ENV.PUBLIC_URL + props.router.location.pathname;
    let matchingMenuItem = null;
    const ul: any = document.getElementById("side-menu");
    if (!ul) return;

    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [props.router.location.pathname, activateParentDropdown]);

  useEffect(() => {
    if (ref.current) {
      ref.current.recalculate();
    }
  }, [userType]); // Re-calculate when userType changes

  useEffect(() => {
    // Dispose previous instance before creating a new one.
    // Without this, every userType change stacks another MetisMenu on the
    // same element — conflicting click handlers cancel each other out,
    // making submenus appear stuck.
    if (metisMenuRef.current) {
      try { metisMenuRef.current.dispose(); } catch (_) { /* ignore */ }
    }
    metisMenuRef.current = new MetisMenu("#side-menu");
    return () => {
      try { metisMenuRef.current?.dispose(); } catch (_) { /* ignore */ }
    };
  }, [userType]); // Re-initialize menu when userType changes

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  // Auto-close sidebar on mobile when route changes (user tapped a menu link)
  // Uses window.screen.width to match the same breakpoint as tToggle() in Header.tsx
  useEffect(() => {
    if (window.screen.width <= 998) {
      document.body.classList.remove("sidebar-enable");
    }
  }, [props.router.location.pathname]);

  function scrollElement(item: any) {
    if (item && ref.current) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar className="h-100" ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {renderMenuByRole()}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

export default withRouter(withTranslation()(SidebarContent));
