import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";

const encryptedBody = (data) => ({
  payload: encryptData(data),
});

export const getPatientsAPI = () =>
  axiosClient.get("/patients");

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