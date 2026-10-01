import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tenant: null,
  loading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: "tenant",

  initialState,

  reducers: {
    fetchTenantRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchTenantSuccess: (state, action) => {
      state.loading = false;
      state.tenant = action.payload;
    },

    fetchTenantFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTenantRequest,
  fetchTenantSuccess,
  fetchTenantFailure,
} = tenantSlice.actions;

export default tenantSlice.reducer;