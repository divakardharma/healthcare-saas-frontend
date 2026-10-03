import {
  call,
  put,
  takeLatest,
} from "redux-saga/effects";

import {
  getCalendarDayAPI,
  getCalendarRangeAPI,
  getUpcomingAPI,
  getCalendarTooltipAPI,
} from "./calendarAPI";

import {
  fetchCalendarDayRequest,
  fetchCalendarRangeRequest,
  fetchUpcomingRequest,
  fetchCalendarSuccess,
  fetchCalendarFailure,
  fetchTooltipRequest,
  fetchTooltipSuccess,
  fetchTooltipFailure,
} from "./calendarSlice";

import { decryptData } from "../../services/encryptionService";

const decryptResponse = (response) =>
  decryptData(response.data.payload);

const getErrorMessage = (error, fallback) => {
  try {
    const payload =
      error.response?.data?.payload;

    if (payload) {
      return (
        decryptData(payload)?.message ||
        fallback
      );
    }
  } catch (_) {}

  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
};

function* fetchDay(action) {
  try {
    const {
      date,
      providerId,
    } = action.payload;

    const result = decryptResponse(
      yield call(
        getCalendarDayAPI,
        date,
        providerId
      )
    );

    yield put(
      fetchCalendarSuccess(
        Array.isArray(result.data)
          ? result.data
          : []
      )
    );
  } catch (error) {
    yield put(
      fetchCalendarFailure(
        getErrorMessage(
          error,
          "Failed to fetch calendar"
        )
      )
    );
  }
}

function* fetchRange(action) {
  try {
    const {
      startDate,
      endDate,
      providerId,
    } = action.payload;

    const result = decryptResponse(
      yield call(
        getCalendarRangeAPI,
        startDate,
        endDate,
        providerId
      )
    );

    yield put(
      fetchCalendarSuccess(
        Array.isArray(result.data)
          ? result.data
          : []
      )
    );
  } catch (error) {
    yield put(
      fetchCalendarFailure(
        getErrorMessage(
          error,
          "Failed to fetch calendar range"
        )
      )
    );
  }
}

function* fetchUpcoming(action) {
  try {
    const result = decryptResponse(
      yield call(
        getUpcomingAPI,
        action.payload
      )
    );

    yield put(
      fetchCalendarSuccess(
        Array.isArray(result.data)
          ? result.data
          : []
      )
    );
  } catch (error) {
    yield put(
      fetchCalendarFailure(
        getErrorMessage(
          error,
          "Failed to fetch upcoming appointments"
        )
      )
    );
  }
}

function* fetchTooltip(action) {
  try {
    const result = decryptResponse(
      yield call(
        getCalendarTooltipAPI,
        action.payload
      )
    );

    yield put(
      fetchTooltipSuccess(result.data)
    );
  } catch (error) {
    yield put(
      fetchTooltipFailure(
        getErrorMessage(
          error,
          "Failed to fetch appointment details"
        )
      )
    );
  }
}

export default function* calendarSaga() {
  yield takeLatest(
    fetchCalendarDayRequest.type,
    fetchDay
  );

  yield takeLatest(
    fetchCalendarRangeRequest.type,
    fetchRange
  );

  yield takeLatest(
    fetchUpcomingRequest.type,
    fetchUpcoming
  );

  yield takeLatest(
    fetchTooltipRequest.type,
    fetchTooltip
  );
}