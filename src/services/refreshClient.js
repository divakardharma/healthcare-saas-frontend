import axios from "axios";
import environment from "../config/environment";
import tokenService from "./tokenService";

const refreshClient = axios.create({
  baseURL: environment.API_PATH,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

refreshClient.interceptors.request.use(
  (config) => {
    const csrfToken = tokenService.getCsrfToken();

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default refreshClient;