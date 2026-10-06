import { call, put, takeLatest } from "redux-saga/effects";
import {
  getBilling,
  getBillingById,
  getPaymentSummary,
  createBilling as createBillingAPI,
  updateBilling as updateBillingAPI,
  deleteBilling as deleteBillingAPI,
  updatePaymentStatus as updatePaymentStatusAPI
} from "./billingAPI";
import { decryptData } from "../../services/encryptionService";
import {
  fetchBilling,
  fetchBillingSuccess,
  fetchBillingFailure,
  fetchBillingById,
  fetchBillingByIdSuccess,
  fetchBillingByIdFailure,
  fetchPaymentSummary,
  fetchPaymentSummarySuccess,
  fetchPaymentSummaryFailure,
  createBilling,
  createBillingSuccess,
  createBillingFailure,
  updateBilling,
  updateBillingSuccess,
  updateBillingFailure,
  deleteBilling,
  deleteBillingSuccess,
  deleteBillingFailure,
  updatePaymentStatus,
  updatePaymentStatusSuccess,
  updatePaymentStatusFailure
} from "./billingSlice";

const getErrorMessage = (error, defaultMessage) => {
  try {
    const encryptedPayload = error.response?.data?.payload;

    if (encryptedPayload) {
      const decryptedError = decryptData(encryptedPayload);

      return (
        decryptedError?.message ||
        decryptedError?.error ||
        defaultMessage
      );
    }

    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      defaultMessage
    );
  } catch (decryptError) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      defaultMessage
    );
  }
};

function* fetchBillingSaga() {
  try {
    const response = yield call(getBilling);
    yield put(fetchBillingSuccess(response));
  } catch (error) {
    yield put(
      fetchBillingFailure(
        getErrorMessage(error, "Failed to load billing")
      )
    );
  }
}

function* fetchBillingByIdSaga(action) {
  try {
    const response = yield call(
      getBillingById,
      action.payload
    );

    yield put(fetchBillingByIdSuccess(response));
  } catch (error) {
    yield put(
      fetchBillingByIdFailure(
        getErrorMessage(error, "Failed to load invoice")
      )
    );
  }
}

function* fetchPaymentSummarySaga() {
  try {
    const response = yield call(getPaymentSummary);
    yield put(fetchPaymentSummarySuccess(response));
  } catch (error) {
    yield put(
      fetchPaymentSummaryFailure(
        getErrorMessage(error, "Failed to load payment summary")
      )
    );
  }
}

function* createBillingSaga(action) {
  try {
    const response = yield call(
      createBillingAPI,
      action.payload
    );

    yield put(createBillingSuccess(response));
    yield put(fetchBilling());
    yield put(fetchPaymentSummary());
  } catch (error) {
    yield put(
      createBillingFailure(
        getErrorMessage(error, "Failed to create invoice")
      )
    );
  }
}

function* updateBillingSaga(action) {
  try {
    const { billingId, data } = action.payload;

    const response = yield call(
      updateBillingAPI,
      billingId,
      data
    );

    yield put(updateBillingSuccess(response));
    yield put(fetchBilling());
    yield put(fetchPaymentSummary());
  } catch (error) {
    yield put(
      updateBillingFailure(
        getErrorMessage(error, "Failed to update invoice")
      )
    );
  }
}

function* deleteBillingSaga(action) {
  try {
    const response = yield call(
      deleteBillingAPI,
      action.payload
    );

    yield put(deleteBillingSuccess(response));
    yield put(fetchBilling());
    yield put(fetchPaymentSummary());
  } catch (error) {
    yield put(
      deleteBillingFailure(
        getErrorMessage(error, "Failed to delete invoice")
      )
    );
  }
}

function* updatePaymentStatusSaga(action) {
  try {
    const { billingId, status } = action.payload;

    const response = yield call(
      updatePaymentStatusAPI,
      billingId,
      status
    );

    yield put(updatePaymentStatusSuccess(response));
    yield put(fetchBilling());
    yield put(fetchPaymentSummary());
  } catch (error) {
    yield put(
      updatePaymentStatusFailure(
        getErrorMessage(error, "Failed to update payment status")
      )
    );
  }
}

export default function* billingSaga() {
  yield takeLatest(fetchBilling.type, fetchBillingSaga);
  yield takeLatest(fetchBillingById.type, fetchBillingByIdSaga);
  yield takeLatest(fetchPaymentSummary.type, fetchPaymentSummarySaga);
  yield takeLatest(createBilling.type, createBillingSaga);
  yield takeLatest(updateBilling.type, updateBillingSaga);
  yield takeLatest(deleteBilling.type, deleteBillingSaga);
  yield takeLatest(
    updatePaymentStatus.type,
    updatePaymentStatusSaga
  );
}