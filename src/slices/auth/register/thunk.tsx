//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeRegister,
  postJwtRegister,
} from "../../../helpers/fakebackend_helper";

// action
import {
  registerUserSuccessful,
  registerUserFailed,
  resetRegisterFlagChange,
  apiErrorChange
} from "./reducer";
import { ENV } from "../../../config/env";

// initialize relavant method of both Auth
const fireBaseBackend = getFirebaseBackend();

// Is user register successfull then direct plot user in redux.
export const registerUser = (user: any) => async (dispatch: any) => {
  try {
    let response;

    if (ENV.REACT_APP_DEFAULTAUTH === "firebase") {
      response = fireBaseBackend.registerUser(user.email, user.password);
    } else if (ENV.REACT_APP_DEFAULTAUTH === "jwt") {
      response = postJwtRegister('/post-jwt-register', user);
    } else if (ENV.REACT_APP_DEFAULTAUTH) {
      response = postFakeRegister(user);
      const data: any = await response;
      dispatch(registerUserSuccessful(data));
    }
  } catch (error) {
    dispatch(registerUserFailed(error));
  }
};

export const resetRegisterFlag = () => {
  try {
    const response = resetRegisterFlagChange();
    return response;
  } catch (error) {
    return error;
  }
};

export const apiError = () => {
  try {
    const response = apiErrorChange("");
    return response;
  } catch (error) {
    return error;
  }
};