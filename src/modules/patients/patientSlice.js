import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const patientSlice = createSlice({
  name: "patients",

  initialState,

  reducers: {
    fetchPatientsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchPatientsSuccess: (state, action) => {
      state.loading = false;
      state.patients = action.payload;
    },

    fetchPatientsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchPatientRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchPatientSuccess: (state, action) => {
      state.loading = false;
      state.selectedPatient = action.payload;
    },

    fetchPatientFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createPatientRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    updatePatientRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    deletePatientRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    patientActionSuccess: (state, action) => {
      state.actionLoading = false;

      if (action.payload?.id) {
        const index = state.patients.findIndex(
          (patient) =>
            patient.id === action.payload.id
        );

        if (index >= 0) {
          state.patients[index] = action.payload;
        }

        state.selectedPatient = action.payload;
      }
    },

    patientActionFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    clearPatientError: (state) => {
      state.error = null;
    },

    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
    },
  },
});

export const {
  fetchPatientsRequest,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  fetchPatientRequest,
  fetchPatientSuccess,
  fetchPatientFailure,
  createPatientRequest,
  updatePatientRequest,
  deletePatientRequest,
  patientActionSuccess,
  patientActionFailure,
  clearPatientError,
  clearSelectedPatient,
} = patientSlice.actions;

export default patientSlice.reducer;