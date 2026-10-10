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
  }
}, [dispatch]);

   useIdleLogout();

useEffect(() => {
  if (authInitializationStarted) {
    return;
  }

  authInitializationStarted = true;

  const loadTenantConfig = () => {
    if (getTenantFromDomain()) {
      dispatch(fetchTenantRequest());
    }
  };

  const initializeAuth = async () => {
    try {
      // 1. Get fresh CSRF token
      const response = await getCsrfToken();

      // 2. Decrypt response
      const decryptedData = decryptData(response.data.payload);

      // 3. Store CSRF in memory
      const csrfToken = decryptedData.data.csrf_token;

      tokenService.setCsrfToken(csrfToken);

      // Tenant config must be requested only AFTER the CSRF request has
      // finished. If both start together on a fresh browser, each request
      // creates its own PHP session and the browser may keep the wrong
      // session cookie -> "CSRF failed" on the first login.
      loadTenantConfig();

      // 4. Restore login only on protected/application pages
      const publicPaths = ["/login", "/register"];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        dispatch(refreshRequest());
      } else {
        dispatch(authInitializationFailed());
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      loadTenantConfig();
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