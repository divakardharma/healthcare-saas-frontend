import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  billing: [],
  summary: null,
  selectedBilling: null,
  loading: false,
  error: null
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    fetchBilling: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBillingSuccess: (state, action) => {
      state.loading = false;
      state.billing = action.payload.data || [];
    },
    fetchBillingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchBillingById: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBillingByIdSuccess: (state, action) => {
      state.loading = false;
      state.selectedBilling = action.payload.data;
    },
    fetchBillingByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchPaymentSummary: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPaymentSummarySuccess: (state, action) => {
      state.loading = false;
      state.summary = action.payload.data;
    },
    fetchPaymentSummaryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createBilling: (state) => {
      state.loading = true;
      state.error = null;
    },
    createBillingSuccess: (state) => {
      state.loading = false;
    },
    createBillingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateBilling: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBillingSuccess: (state) => {
      state.loading = false;
    },
    updateBillingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteBilling: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteBillingSuccess: (state) => {
      state.loading = false;
    },
    deleteBillingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updatePaymentStatus: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePaymentStatusSuccess: (state) => {
      state.loading = false;
    },
    updatePaymentStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
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
} = billingSlice.actions;

export default billingSlice.reducer;