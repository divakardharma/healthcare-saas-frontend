import { call, put, takeLatest } from "redux-saga/effects";
import { getDashboard } from "./dashboardAPI";
import {
  fetchDashboard,
  fetchDashboardSuccess,
  fetchDashboardFailure
} from "./dashboardSlice";

function* fetchDashboardSaga() {
  try {
    const response = yield call(getDashboard);
    yield put(fetchDashboardSuccess(response));
  } catch (error) {
    yield put(
      fetchDashboardFailure(
        error.response?.data?.message || "Failed to load dashboard"
      )
    );
  }
}

export default function* dashboardSaga() {
  yield takeLatest(fetchDashboard.type, fetchDashboardSaga);
}