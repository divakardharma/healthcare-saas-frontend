import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prescriptions: [],
  selectedPrescription: null,
  loading: false,
  error: null
};

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    fetchPrescriptions: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPrescriptionsSuccess: (state, action) => {
      state.loading = false;
      state.prescriptions = action.payload;
    },
    fetchPrescriptionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPrescriptionById: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPrescriptionByIdSuccess: (state, action) => {
      state.loading = false;
      state.selectedPrescription = action.payload;
    },
    fetchPrescriptionByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createPrescription: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPrescriptionSuccess: (state, action) => {
      state.loading = false;
      state.prescriptions.unshift(action.payload);
    },
    createPrescriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePrescription: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePrescriptionSuccess: (state) => {
      state.loading = false;
    },
    updatePrescriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deletePrescription: (state) => {
      state.loading = true;
      state.error = null;
    },
    deletePrescriptionSuccess: (state, action) => {
      state.loading = false;
      state.prescriptions = state.prescriptions.filter(
        (prescription) => prescription.id !== action.payload
      );
    },
    deletePrescriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePrescriptionStatus: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePrescriptionStatusSuccess: (state) => {
      state.loading = false;
    },
    updatePrescriptionStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchPrescriptions,
  fetchPrescriptionsSuccess,
  fetchPrescriptionsFailure,
  fetchPrescriptionById,
  fetchPrescriptionByIdSuccess,
  fetchPrescriptionByIdFailure,
  createPrescription,
  createPrescriptionSuccess,
  createPrescriptionFailure,
  updatePrescription,
  updatePrescriptionSuccess,
  updatePrescriptionFailure,
  deletePrescription,
  deletePrescriptionSuccess,
  deletePrescriptionFailure,
  updatePrescriptionStatus,
  updatePrescriptionStatusSuccess,
  updatePrescriptionStatusFailure
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;