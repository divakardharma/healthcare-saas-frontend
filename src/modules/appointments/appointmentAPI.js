import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";

const encryptedBody = (data) => ({
  payload: encryptData(data),
});

export const getAppointmentsAPI = () =>
  axiosClient.get("/appointments");

export const getAppointmentAPI = (id) =>
  axiosClient.get(`/appointments/${id}`);

export const createAppointmentAPI = (data) =>
  axiosClient.post(
    "/appointments",
    encryptedBody(data)
  );

export const updateAppointmentAPI = (id, data) =>
  axiosClient.put(
    `/appointments/${id}`,
    encryptedBody(data)
  );

export const updateAppointmentStatusAPI = (
  id,
  status
) =>
  axiosClient.patch(
    `/appointments/${id}/status`,
    encryptedBody({ status })
  );

export const cancelAppointmentAPI = (id) =>
  axiosClient.put(
    `/appointments/${id}/cancel`
  );