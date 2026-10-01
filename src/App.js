import { useEffect } from "react";
import { useDispatch } from "react-redux";

import AppRouter from "./routes/AppRouter";

import { getCsrfToken } from "./modules/auth/authAPI";
import { refreshRequest } from "./modules/auth/authSlice";

import tokenService from "./services/tokenService";
import { decryptData } from "./services/encryptionService";

let authInitializationStarted = false;

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (authInitializationStarted) {
      return;
    }

    authInitializationStarted = true;

    const initializeAuth = async () => {
      try {
        // 1. Get fresh CSRF token
        const response = await getCsrfToken();

        // 2. Decrypt response
        const decryptedData = decryptData(
          response.data.payload
        );

        // 3. Store CSRF in memory
        const csrfToken =
          decryptedData.data.csrf_token;

        tokenService.setCsrfToken(csrfToken);

        // 4. Restore login using HttpOnly refresh cookie
        dispatch(refreshRequest());

      } catch (error) {
        console.error(
          "Auth initialization failed:",
          error
        );
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <AppRouter />;
}

export default App;