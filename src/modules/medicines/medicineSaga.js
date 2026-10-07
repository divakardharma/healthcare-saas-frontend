import { call, put, takeLatest } from "redux-saga/effects";
import { getMedicines } from "./medicineAPI";
import {
  fetchMedicines,
  fetchMedicinesSuccess,
  fetchMedicinesFailure
} from "./medicineSlice";

function* fetchMedicinesSaga() {
  try {
    const response = yield call(getMedicines);
    yield put(fetchMedicinesSuccess(response));
  } catch (error) {
    yield put(
      fetchMedicinesFailure(
        error.response?.data?.message || "Failed to load medicines"
      )
    );
  }
}

export default function* medicineSaga() {
  yield takeLatest(
    fetchMedicines.type,
    fetchMedicinesSaga
  );
}