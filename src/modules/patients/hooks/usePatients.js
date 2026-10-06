import { useCallback } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchPatientsRequest,
  fetchPatientRequest,
  createPatientRequest,
  updatePatientRequest,
  deletePatientRequest,
  clearPatientError,
} from "../patientSlice";

export default function usePatients() {
  const dispatch = useDispatch();

  const state = useSelector(
    (store) => store.patients
  );

  const fetchPatients = useCallback(
    (page = 1, options = {}) =>
      dispatch(fetchPatientsRequest(page, options)),
    [dispatch]
  );

  const fetchPatient = useCallback(
    (id) => dispatch(fetchPatientRequest(id)),
    [dispatch]
  );

  const createPatient = useCallback(
    (data) =>
      dispatch(createPatientRequest(data)),
    [dispatch]
  );

  const updatePatient = useCallback(
    (id, data) =>
      dispatch(
        updatePatientRequest({ id, data })
      ),
    [dispatch]
  );

  const deletePatient = useCallback(
    (id) =>
      dispatch(deletePatientRequest(id)),
    [dispatch]
  );

  const clearError = useCallback(
    () => dispatch(clearPatientError()),
    [dispatch]
  );

  return {
    ...state,
    fetchPatients,
    fetchPatient,
    createPatient,
    updatePatient,
    deletePatient,
    clearError,
  };
}