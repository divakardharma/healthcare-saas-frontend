import { useCallback } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchAppointmentsRequest,
  fetchAppointmentRequest,
  createAppointmentRequest,
  updateAppointmentRequest,
  updateAppointmentStatusRequest,
  cancelAppointmentRequest,
  clearAppointmentError,
} from "../appointmentSlice";

export default function useAppointments() {
  const dispatch = useDispatch();

  const state = useSelector(
    (store) => store.appointments
  );

  // fetchAppointments()            -> batch 1
  // fetchAppointments(2)           -> batch 2
  // fetchAppointments(2, { prefetch: true }) -> background request for batch 2
  const fetchAppointments = useCallback(
    (page = 1, options = {}) =>
      dispatch(
        fetchAppointmentsRequest(page, options)
      ),
    [dispatch]
  );

  const fetchAppointment = useCallback(
    (id) =>
      dispatch(
        fetchAppointmentRequest(id)
      ),
    [dispatch]
  );

  const createAppointment = useCallback(
    (data) =>
      dispatch(
        createAppointmentRequest(data)
      ),
    [dispatch]
  );

  const updateAppointment = useCallback(
    (id, data) =>
      dispatch(
        updateAppointmentRequest({
          id,
          data,
        })
      ),
    [dispatch]
  );

  const updateStatus = useCallback(
    (id, status) =>
      dispatch(
        updateAppointmentStatusRequest({
          id,
          status,
        })
      ),
    [dispatch]
  );

  const cancelAppointment = useCallback(
    (id) =>
      dispatch(
        cancelAppointmentRequest(id)
      ),
    [dispatch]
  );

  const clearError = useCallback(
    () =>
      dispatch(
        clearAppointmentError()
      ),
    [dispatch]
  );

  return {
    ...state,
    fetchAppointments,
    fetchAppointment,
    createAppointment,
    updateAppointment,
    updateStatus,
    cancelAppointment,
    clearError,
  };
}