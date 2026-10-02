import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader } from "../components/common";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Auth/RegisterPage"));
const DashboardPage = lazy(() =>import("../pages/Dashboard/DashboardPage"));

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<h1>Healthcare SaaS</h1>} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

           <Route path="/dashboard" element={
           <ProtectedRoute>
              <DashboardPage />
          </ProtectedRoute>}/>

          
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;