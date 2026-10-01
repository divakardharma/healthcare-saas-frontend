import { useDispatch, useSelector } from "react-redux";
import {
  loginRequest,
  logoutRequest,
} from "../authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

const {
  user,
  accessToken,
  isAuthenticated,
  loading,
  error,
  initialized,
} = useSelector((state) => state.auth);

  const login = (loginData) => {
    dispatch(loginRequest(loginData));
  };

const logoutUser = () => {
  dispatch(logoutRequest());
};

return {
  user,
  accessToken,
  isAuthenticated,
  loading,
  error,
  initialized,
  login,
  logoutUser,
};
};

export default useAuth;