import { all } from "redux-saga/effects";

import authSaga from "../modules/auth/authSaga";
import tenantSaga from "../modules/tenant/tenantSaga";

import userSaga from "../modules/users/userSaga";
import patientSaga from "../modules/patients/patientSaga";
import appointmentSaga from "../modules/appointments/appointmentSaga";
import calendarSaga from "../modules/calendar/calendarSaga";
import chatSaga from "../modules/chat/chatSaga";

import offlineSaga from "../modules/offline/offlineSaga";

export default function* rootSaga() {
  yield all([
    authSaga(),
    tenantSaga(),

    userSaga(),
    patientSaga(),
    appointmentSaga(),
    calendarSaga(),
    chatSaga(),

    /*
     * Offline Queue
     */
    offlineSaga(),
  ]);
}