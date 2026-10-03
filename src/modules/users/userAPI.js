import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";

const encryptedBody = (data) => ({
  payload: encryptData(data),
});

export const getUsersAPI = (role) =>
  axiosClient.get(
    role ? `/users?role=${encodeURIComponent(role)}` : "/users"
  );

export const getUserAPI = (id) =>
  axiosClient.get(`/users/${id}`);

export const createUserAPI = (data) =>
  axiosClient.post("/users", encryptedBody(data));

export const updateUserAPI = (id, data) =>
  axiosClient.put(`/users/${id}`, encryptedBody(data));

export const assignRoleAPI = (id, role) =>
  axiosClient.post(
    `/users/${id}/roles`,
    encryptedBody({ role })
  );

export const removeRoleAPI = (id, role) =>
  axiosClient.delete(
    `/users/${id}/roles/${encodeURIComponent(role)}`
  );

export const deleteUserAPI = (id) =>
  axiosClient.delete(`/users/${id}`);