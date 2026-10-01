import axios from "axios";
import tokenService from "./tokenService";
import environment from "../config/environment";

const axiosClient = axios.create({
  baseURL: environment.API_PATH,

  withCredentials: true,
  
  headers: {
    "Content-Type": "application/json",
  },
});

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

    console.log("Request Interceptor:", config);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log("Response Interceptor:", response);

    return response;
  },
  (error) => {
    console.log("Response Error:", error);

    return Promise.reject(error);
  }
);

export default axiosClient; 