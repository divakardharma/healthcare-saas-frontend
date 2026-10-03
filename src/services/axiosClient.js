import axios from "axios";
import tokenService from "./tokenService";
import environment from "../config/environment";
import refreshClient from "./refreshClient";
import { decryptData } from "./encryptionService";

const axiosClient = axios.create({
  baseURL: environment.API_PATH,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise = null;

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenService.getAccessToken();
    const csrfToken = tokenService.getCsrfToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response,

 async (error) => {
  const status = error.response?.status;
  const originalRequest = error.config;

  const isPublicAuthRequest =
    originalRequest?.url?.includes("/login") ||
    originalRequest?.url?.includes("/register");

  if (
    status === 401 &&
    originalRequest &&
    !originalRequest._retry &&
    !isPublicAuthRequest
  ) {
    originalRequest._retry = true;

    try {
      // existing refresh code...
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = refreshClient
            .post("/refresh")
            .then((response) => {
              const decryptedData = decryptData(response.data.payload);

              const { access_token, csrf_token } = decryptedData.data;

              tokenService.setAccessToken(access_token);
              tokenService.setCsrfToken(csrf_token);

              return {
                accessToken: access_token,
                csrfToken: csrf_token,
              };
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        const { accessToken, csrfToken } = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        if (csrfToken) {
          originalRequest.headers["X-CSRF-Token"] = csrfToken;
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        tokenService.clearTokens();
        tokenService.handleAuthFailure();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;