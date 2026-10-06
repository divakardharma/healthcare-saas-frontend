import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../modules/auth/authSlice";
import tenantReducer from "../modules/tenant/tenantSlice";

import userReducer from "../modules/users/userSlice";
import patientReducer from "../modules/patients/patientSlice";
import appointmentReducer from "../modules/appointments/appointmentSlice";
import calendarReducer from "../modules/calendar/calendarSlice";
import chatReducer from "../modules/chat/chatSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  tenant: tenantReducer,

  users: userReducer,
  patients: patientReducer,
  appointments: appointmentReducer,
  calendar: calendarReducer,
  chat: chatReducer,
});

export default rootReducer;