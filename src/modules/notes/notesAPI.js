import axiosClient from "../../services/axiosClient";
import {
  encryptData,
  decryptData
} from "../../services/encryptionService";

export const getNotesByAppointment = async (appointmentId) => {
  const response = await axiosClient.get(
    `/appointments/${appointmentId}/notes`
  );

  const decryptedData = decryptData(response.data.payload);

  return decryptedData.data;
};

export const createNote = async (data) => {
  const encryptedData = encryptData(data);

  const response = await axiosClient.post(
    "/notes",
    { payload: encryptedData }
  );

  return decryptData(response.data.payload);
};

export const updateNote = async (noteId, data) => {
  const encryptedData = encryptData(data);

  const response = await axiosClient.put(
    `/notes/${noteId}`,
    { payload: encryptedData }
  );

  return decryptData(response.data.payload);
};

export const deleteNote = async (noteId) => {
  const response = await axiosClient.delete(
    `/notes/${noteId}`
  );

  return decryptData(response.data.payload);
};