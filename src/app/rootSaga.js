import { all } from "redux-saga/effects";
import authSaga from "../modules/auth/authSaga";
import tenantSaga from "../modules/tenant/tenantSaga";
import userSaga from "../modules/users/userSaga";
import patientSaga from "../modules/patients/patientSaga";
import appointmentSaga from "../modules/appointments/appointmentSaga";
import calendarSaga from "../modules/calendar/calendarSaga";
import dashboardSaga from "../modules/dashboard/dashboardSaga";
import prescriptionSaga from "../modules/prescription/prescriptionSaga";
import staffSaga from "../modules/staff/staffSaga";
import billingSaga from "../modules/billing/billingSaga";
import notificationsSaga from "../modules/notifications/notificationsSaga";

export default function* rootSaga() {
  yield all([
    authSaga(),
    tenantSaga(),
    userSaga(),
    patientSaga(),
    appointmentSaga(),
    calendarSaga(),
    dashboardSaga(),
    prescriptionSaga(),
    staffSaga(),
    billingSaga(),
    notificationsSaga()
  ]);
}