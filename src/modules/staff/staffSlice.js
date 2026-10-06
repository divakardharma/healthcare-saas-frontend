import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  staff: [],
  loading: false,
  error: null
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    fetchStaff: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess: (state, action) => {
      state.loading = false;
      state.staff = action.payload.data || [];
    },
    fetchStaffFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStaffRole: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStaffRoleSuccess: (state) => {
      state.loading = false;
    },
    updateStaffRoleFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStaffStatus: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStaffStatusSuccess: (state) => {
      state.loading = false;
    },
    updateStaffStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchStaff,
  fetchStaffSuccess,
  fetchStaffFailure,
  updateStaffRole,
  updateStaffRoleSuccess,
  updateStaffRoleFailure,
  updateStaffStatus,
  updateStaffStatusSuccess,
  updateStaffStatusFailure
} = staffSlice.actions;

export default staffSlice.reducer;