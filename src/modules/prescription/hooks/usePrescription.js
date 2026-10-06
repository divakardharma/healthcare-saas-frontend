import { useDispatch, useSelector } from "react-redux";
import {
  fetchPrescriptions,
  fetchPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  updatePrescriptionStatus
} from "../prescriptionSlice";

export const usePrescription = () => {
  const dispatch = useDispatch();

  const {
    prescriptions,
    selectedPrescription,
    loading,
    error
  } = useSelector((state) => state.prescription);

  const loadPrescriptions = () => {
    dispatch(fetchPrescriptions());
  };

  const loadPrescription = (id) => {
    dispatch(fetchPrescriptionById(id));
  };

  const addPrescription = (data) => {
    dispatch(createPrescription(data));
  };

  const editPrescription = (id, data) => {
    dispatch(
      updatePrescription({
        id,
        data
      })
    );
  };

  const removePrescription = (id) => {
    dispatch(deletePrescription(id));
  };

  const changePrescriptionStatus = (id, data) => {
    dispatch(
      updatePrescriptionStatus({
        id,
        data
      })
    );
  };

  return {
    prescriptions,
    selectedPrescription,
    loading,
    error,
    loadPrescriptions,
    loadPrescription,
    addPrescription,
    editPrescription,
    removePrescription,
    changePrescriptionStatus
  };
};