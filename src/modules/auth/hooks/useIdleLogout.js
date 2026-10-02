import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutRequest } from "../authSlice";
import useAuth from "./useAuth";

function useIdleLogout(timeout = 15 * 60 * 1000) {
  const dispatch = useDispatch();
  const { isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (!initialized || !isAuthenticated) {
      return;
    }

    let timer;

    const resetTimer = () => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        dispatch(logoutRequest());
      }, timeout);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [dispatch, isAuthenticated, initialized, timeout]);
}

export default useIdleLogout;