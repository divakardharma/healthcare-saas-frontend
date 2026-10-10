import {
  combineReducers,
} from "@reduxjs/toolkit";

import authReducer from "../modules/auth/authSlice";
import tenantReducer from "../modules/tenant/tenantSlice";

import userReducer from "../modules/users/userSlice";
import patientReducer from "../modules/patients/patientSlice";
import appointmentReducer from "../modules/appointments/appointmentSlice";
import calendarReducer from "../modules/calendar/calendarSlice";
import chatReducer from "../modules/chat/chatSlice";

import dashboardReducer from "../modules/dashboard/dashboardSlice";
import prescriptionReducer from "../modules/prescription/prescriptionSlice";
import staffReducer from "../modules/staff/staffSlice";
import billingReducer from "../modules/billing/billingSlice";
import notificationsReducer from "../modules/notifications/notificationsSlice";
import notesReducer from "../modules/notes/notesSlice";
import medicineReducer from "../modules/medicines/medicineSlice";

import offlineReducer from "../modules/offline/offlineSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  tenant: tenantReducer,
  users: userReducer,
  patients: patientReducer,
  appointments: appointmentReducer,
  calendar: calendarReducer,
  dashboard: dashboardReducer,
  prescription: prescriptionReducer,
  staff: staffReducer,
  billing: billingReducer,
  notifications: notificationsReducer,
  chat: chatReducer,
  notes: notesReducer,
  medicines: medicineReducer,

  offline: offlineReducer   // <-- ADD THIS (missing-a irundhuchu)
});

export default rootReducer;