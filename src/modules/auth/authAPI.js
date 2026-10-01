import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";

export const getCsrfToken = () => {
  return axiosClient.get("/csrf-token");
};

export const loginAPI = (loginData) => {
  const encryptedPayload = encryptData(loginData);

  return axiosClient.post("/login", {
    payload: encryptedPayload,
  });
};

export const refreshTokenAPI = () => {
  return axiosClient.post("/refresh");
};

export const logoutAPI = () => {
  return axiosClient.post("/logout");
};