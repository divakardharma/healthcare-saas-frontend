import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tenant: null,
  subdomain: null,
  loading: false,
  error: null,
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
  },
});

export const {
  setTenant,
  fetchTenantRequest,
  fetchTenantSuccess,
  fetchTenantFailure,
} = tenantSlice.actions;

export default tenantSlice.reducer;