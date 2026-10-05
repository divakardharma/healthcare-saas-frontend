import axiosClient from "../../services/axiosClient";
import { encryptData, decryptData } from "../../services/encryptionService";

export const getPrescriptions = async () => {
  const response = await axiosClient.get("/prescriptions");
  return decryptData(response.data.payload);
};

export const getPrescriptionById = async (id) => {
  const response = await axiosClient.get(`/prescriptions/${id}`);
  return decryptData(response.data.payload);
};

export const createPrescription = async (data) => {
  const response = await axiosClient.post("/prescriptions", {
    payload: encryptData(data)
  });

  return decryptData(response.data.payload);
};

export const updatePrescription = async (id, data) => {
  const response = await axiosClient.put(`/prescriptions/${id}`, {
    payload: encryptData(data)
  });

  return decryptData(response.data.payload);
};

export const deletePrescription = async (id) => {
  const response = await axiosClient.delete(`/prescriptions/${id}`);
  return decryptData(response.data.payload);
};

export const updatePrescriptionStatus = async (id, data) => {
  const response = await axiosClient.patch(
    `/prescriptions/${id}/status`,
    {
      payload: encryptData(data)
    }
  );

  return decryptData(response.data.payload);
};