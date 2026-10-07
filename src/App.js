// ============================================================
// 1. IMPORTS
// ============================================================

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


// ============================================================
// 2. AUTH INITIALIZATION FLAG
// ============================================================

let authInitializationStarted = false;


// ============================================================
// 3. MAIN APP COMPONENT
// ============================================================

function App() {

  // ----------------------------------------------------------
  // 3.1 GET REDUX DISPATCH
  // ----------------------------------------------------------

  const dispatch = useDispatch();


  // ----------------------------------------------------------
  // 3.2 GET CURRENT TENANT
  // ----------------------------------------------------------

  const { tenant } = useTenant();


  // ----------------------------------------------------------
  // 3.3 CREATE TENANT THEME
  // ----------------------------------------------------------

  const theme = createTenantTheme(tenant);


  // ==========================================================
  // 3.4 TENANT INITIALIZATION
  // ==========================================================

  useEffect(() => {

    const subdomain = getTenantFromDomain();

    if (subdomain) {

      dispatch(setTenant(subdomain));

      dispatch(fetchTenantRequest());

    }

  }, [dispatch]);


  // ==========================================================
  // 3.5 IDLE LOGOUT
  // ==========================================================

  useIdleLogout();


  // ==========================================================
  // 3.6 AUTHENTICATION INITIALIZATION
  // ==========================================================

  useEffect(() => {

    if (authInitializationStarted) {
      return;
    }

    authInitializationStarted = true;


    const initializeAuth = async () => {

      try {

        // Get fresh CSRF token
        const response = await getCsrfToken();


        // Decrypt backend response
        const decryptedData =
          decryptData(response.data.payload);


        // Get CSRF token
        const csrfToken =
          decryptedData.data.csrf_token;


        // Store CSRF token
        tokenService.setCsrfToken(csrfToken);


        // Check current URL
        const publicPaths = [
          "/login",
          "/register",
        ];

        const currentPath =
          window.location.pathname;


        // Restore authentication on protected pages
        if (!publicPaths.includes(currentPath)) {

          dispatch(refreshRequest());

        } else {

          dispatch(authInitializationFailed());

        }

      } catch (error) {

        console.error(
          "Auth initialization failed:",
          error
        );

        dispatch(authInitializationFailed());

      }

    };


    // Start authentication initialization
    initializeAuth();

  }, [dispatch]);


  // ==========================================================
  // 3.7 AUTHENTICATION FAILURE HANDLER
  // ==========================================================

  useEffect(() => {

    tokenService.setAuthFailureHandler(() => {

      dispatch(logoutSuccess());

    });


    // Cleanup
    return () => {

      tokenService.setAuthFailureHandler(null);

    };

  }, [dispatch]);


  // ==========================================================
  // 4. RENDER APPLICATION
  // ==========================================================

  return (

    <ThemeProvider theme={theme}>

      <GlobalStyle />

      <ErrorBoundary>

        <AppRouter />

      </ErrorBoundary>

    </ThemeProvider>

  );
}


// ============================================================
// 5. EXPORT APP
// ============================================================

export default App;