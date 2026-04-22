import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";

const AuthProtected = (props: any) => {
  const { jwt } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If access token already in memory (e.g. navigating between pages), skip refresh
    if (jwt) {
      setChecking(false);
      return;
    }

    // Access token gone (page refresh) — restore via HttpOnly cookie
    authService.refreshToken()
      .then(() => setChecking(false))
      .catch(() => {
        // Refresh token cookie expired or missing — clear profile and redirect to login
        localStorage.removeItem("authUser");
        localStorage.removeItem("userProfile");
        setChecking(false);
      });
  }, [jwt]);

  // Wait for refresh attempt before rendering or redirecting
  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!localStorage.getItem("authUser")) {
    return <Navigate to={{ pathname: "/login" }} />;
  }

  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  );
};

export default AuthProtected;
