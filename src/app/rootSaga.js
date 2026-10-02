import { all } from "redux-saga/effects";
import authSaga from "../modules/auth/authSaga";
import tenantSaga from "../modules/tenant/tenantSaga";

export default function* rootSaga() {
  yield all([
    authSaga(),
    tenantSaga(),
  ]);
}