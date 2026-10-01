import { combineReducers } from "@reduxjs/toolkit";
import tenantReducer from "../modules/tenant/tenantSlice";
import authReducer from "../modules/auth/authSlice";

const rootReducer = combineReducers({
  tenant: tenantReducer,
  auth: authReducer,
});

export default rootReducer;