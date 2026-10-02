import { useEffect } from "react";
import { useDispatch } from "react-redux";

import AppRouter from "./routes/AppRouter";

import { getCsrfToken } from "./modules/auth/authAPI";
import {
  refreshRequest,
  logoutSuccess,
  authInitializationFailed,
} from "./modules/auth/authSlice";

import tokenService from "./services/tokenService";
import { decryptData } from "./services/encryptionService";

import { ThemeProvider } from "styled-components";

import GlobalStyle from "./styles/GlobalStyle";

import ErrorBoundary from "./components/common/ErrorBoundary";
import useIdleLogout from "./modules/auth/hooks/useIdleLogout";
import getTenantFromDomain from "./utils/getTenantFromDomain";
import {
  setTenant,
  fetchTenantRequest,
} from "./modules/tenant/tenantSlice";
import useTenant from "./modules/tenant/hooks/useTenant";
import createTenantTheme from "./themes/createTenantTheme";

let authInitializationStarted = false;

function App() {
  const dispatch = useDispatch();
  const { tenant } = useTenant();
const theme = createTenantTheme(tenant);

useEffect(() => {
  const subdomain = getTenantFromDomain();

  if (subdomain) {
    dispatch(setTenant(subdomain));
    dispatch(fetchTenantRequest());
  }
}, [dispatch]);

   useIdleLogout();

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
  console.error("Auth initialization failed:", error);
  dispatch(authInitializationFailed());
}
    };

    initializeAuth();
  }, [dispatch]);

  
    useEffect(() => {
  tokenService.setAuthFailureHandler(() => {
    dispatch(logoutSuccess());
  });

  return () => {
    tokenService.setAuthFailureHandler(null);
  };
}, [dispatch]);

return (
 <ThemeProvider theme={theme}>
    <GlobalStyle />

    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </ThemeProvider>
);
}

export default App;