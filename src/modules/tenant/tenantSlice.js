import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tenant: null,
  subdomain: null,
  loading: false,
  error: null,
  registrationSuccess: false,
};

const tenantSlice = createSlice({
  name: "tenant",

  initialState,

  reducers: {
    setTenant: (state, action) => {
      state.subdomain = action.payload;
      state.tenant = {
        subdomain: action.payload,
      };
    },

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

    registerTenantRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.registrationSuccess = false;
    },

    registerTenantSuccess: (state, action) => {
      state.loading = false;
      state.tenant = action.payload;
      state.registrationSuccess = true;
    },

    registerTenantFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.registrationSuccess = false;
    },
  },
});

export const {
  setTenant,
  fetchTenantRequest,
  fetchTenantSuccess,
  fetchTenantFailure,
  registerTenantRequest,
  registerTenantSuccess,
  registerTenantFailure,
} = tenantSlice.actions;

export default tenantSlice.reducer;