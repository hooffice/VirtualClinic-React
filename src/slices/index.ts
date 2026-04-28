import { combineReducers } from "redux";

// Front
import layoutReducer from "./layouts/reducer";
import loginReducer from "./auth/login/reducer";
import profileReducer from "./auth/profile/reducer";
import forgotPasswordReducer from "./auth/forgetpwd/reducer";
import accountReducer from "./auth/register/reducer";
import roleReducer from "./auth/role/reducer";
import registerReducer from "./auth/register/reducer";
//Admin Module
import organizationReducer from "./admin/organization/reducer";
import clinicReducer from "./admin/clinic/clinicSlice";
import employerReducer from "./admin/employer/employerSlice";
import clinicianReducer from "./admin/clinician/clinicianSlice";

const rootReducer = combineReducers({
    Layout: layoutReducer,
    Login: loginReducer,
    Profile: profileReducer,
    ForgetPassword: forgotPasswordReducer,
    Account: accountReducer,
    register: registerReducer,
    role: roleReducer,
    Organization: organizationReducer,
    Clinic: clinicReducer,
    Employer: employerReducer,
    Clinician: clinicianReducer,
});

export default rootReducer;