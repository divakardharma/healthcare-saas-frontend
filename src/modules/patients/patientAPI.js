import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";

const encryptedBody = (data) => ({
  payload: encryptData(data),
});

// One API request = one batch of patients. The backend owns the batch size
// (16), so only the batch number is sent.
export const getPatientsAPI = (page = 1) =>
  axiosClient.get("/patients", { params: { page } });

export const getPatientAPI = (id) =>
  axiosClient.get(`/patients/${id}`);

export const createPatientAPI = (data) =>
  axiosClient.post(
    "/patients",
    encryptedBody(data)
  );

export const updatePatientAPI = (id, data) =>
  axiosClient.put(
    `/patients/${id}`,
    encryptedBody(data)
  );

export const deletePatientAPI = (id) =>
  axiosClient.delete(`/patients/${id}`);