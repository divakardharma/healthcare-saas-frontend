import { all } from "redux-saga/effects";
import authSaga from "../modules/auth/authSaga";
import tenantSaga from "../modules/tenant/tenantSaga";

import dashboardSaga from "../modules/dashboard/dashboardSaga";
import prescriptionSaga from "../modules/prescription/prescriptionSaga";

export default function* rootSaga() {
  yield all([
    authSaga(),
    tenantSaga(),
    dashboardSaga(),
    prescriptionSaga(),
  ]);
}