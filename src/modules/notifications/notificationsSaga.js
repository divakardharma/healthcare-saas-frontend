import { call, put, takeLatest } from "redux-saga/effects";
import { getNotifications } from "./notificationsAPI";
import {
  fetchNotifications,
  fetchNotificationsSuccess,
  fetchNotificationsFailure
} from "./notificationsSlice";

function* fetchNotificationsSaga() {
  try {
    const response = yield call(getNotifications);
    yield put(fetchNotificationsSuccess(response));
  } catch (error) {
    yield put(
      fetchNotificationsFailure(
        error.response?.data?.message || "Failed to load notifications"
      )
    );
  }
}

export default function* notificationsSaga() {
  yield takeLatest(
    fetchNotifications.type,
    fetchNotificationsSaga
  );
}