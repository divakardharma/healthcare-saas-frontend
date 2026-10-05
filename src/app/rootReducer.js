import { combineReducers } from "@reduxjs/toolkit";
import tenantReducer from "../modules/tenant/tenantSlice";
import authReducer from "../modules/auth/authSlice";

import dashboardReducer from "../modules/dashboard/dashboardSlice";
import prescriptionReducer from "../modules/prescription/prescriptionSlice";

const rootReducer = combineReducers({
  tenant: tenantReducer,
  auth: authReducer,
  dashboard: dashboardReducer,
  prescription: prescriptionReducer,
});

export default rootReducer;