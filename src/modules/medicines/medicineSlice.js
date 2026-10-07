import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  medicines: [],
  loading: false,
  error: null
};

const medicineSlice = createSlice({
  name: "medicines",
  initialState,
  reducers: {
    fetchMedicines: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMedicinesSuccess: (state, action) => {
      state.loading = false;
      state.medicines = action.payload;
    },
    fetchMedicinesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchMedicines,
  fetchMedicinesSuccess,
  fetchMedicinesFailure
} = medicineSlice.actions;

export default medicineSlice.reducer;