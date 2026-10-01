import axiosClient from "../../services/axiosClient";

export const fetchTenantConfig = () => {
  return axiosClient.get("/tenant/config");
};