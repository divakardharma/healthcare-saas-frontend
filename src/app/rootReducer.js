import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../modules/auth/authSlice";
import tenantReducer from "../modules/tenant/tenantSlice";

import userReducer from "../modules/users/userSlice";
import patientReducer from "../modules/patients/patientSlice";
import appointmentReducer from "../modules/appointments/appointmentSlice";
import calendarReducer from "../modules/calendar/calendarSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  tenant: tenantReducer,

  users: userReducer,
  patients: patientReducer,
  appointments: appointmentReducer,
  calendar: calendarReducer,
});

export default rootReducer;