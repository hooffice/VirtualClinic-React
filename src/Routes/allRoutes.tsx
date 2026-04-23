import { Navigate } from "react-router-dom"
import Dashboard from "../pages/Dashboard";

// Admin
import OrganizationList from "pages/Admin/Organization";

// Auth
import Login from "pages/Authentication/login";
import Logout from "pages/Authentication/Logout";
import UserProfile from "pages/Authentication/user-profile";
import ForgotPassword from "pages/Authentication/ForgotPassword";
import SignUp from "pages/Authentication/Register"

// OAuth & MFA
import OAuthCallback from "pages/Authentication/OAuthCallback";
import MfaVerification from "pages/Authentication/MfaVerification";
import MfaSetup from "pages/Authentication/MfaSetup";
import EmailVerification from "pages/Authentication/EmailVerification";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/profile", component: <UserProfile /> },

  // Admin
  { path: "/admin/organizations", component: <OrganizationList /> },

  { path: "/", exact: true, component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/logout", component: <Logout /> },
  { path: "/forgot-password", component: <ForgotPassword /> },
  { path: "/register", component: <SignUp /> },

  // OAuth & MFA flows
  { path: "/oauth-callback", component: <OAuthCallback /> },
  { path: "/mfa-verification", component: <MfaVerification /> },
  { path: "/mfa-setup", component: <MfaSetup /> },
  { path: "/email-verification", component: <EmailVerification /> },
]
export { authProtectedRoutes, publicRoutes };
