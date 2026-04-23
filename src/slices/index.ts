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

const rootReducer = combineReducers({
    Layout: layoutReducer,
    Login: loginReducer,
    Profile: profileReducer,
    ForgetPassword: forgotPasswordReducer,
    Account: accountReducer,
    register: registerReducer,
    role: roleReducer,
    Organization: organizationReducer
});

export default rootReducer;