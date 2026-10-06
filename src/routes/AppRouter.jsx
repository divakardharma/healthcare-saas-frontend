import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import { Loader } from "../components/common";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const PrescriptionPage = lazy(() => import("../pages/Prescription/PrescriptionPage"));
const UserManagement = lazy(() => import("../pages/Settings/UserManagement"));
const PatientList = lazy(() => import("../pages/Patients/PatientList"));
const PatientProfile = lazy(() => import("../pages/Patients/PatientProfile"));
const AppointmentList = lazy(() => import("../pages/Appointments/AppointmentList"));
const AppointmentCalendar = lazy(() => import("../pages/Appointments/AppointmentCalendar"));
const StaffPage = lazy(() => import("../pages/Staff/StaffPage"));
const BillingPage = lazy(() => import("../pages/Billing/BillingPage"));
const NotificationsPage = lazy(
  () => import("../pages/Notifications/NotificationsPage")
);

const ChatPage = lazy(
  () =>
    import(
      "../pages/Chat/ChatPage"
    )
);

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/register"
            element={<RegisterPage />}
          />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <DashboardPage />
              </Protected>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <Protected>
                <PrescriptionPage />
              </Protected>
            }
          />
<Route
  path="/staff"
  element={
    <RoleBasedRoute allowedRoles={["Admin"]}>
      <StaffPage />
    </RoleBasedRoute>
  }
/>

<Route
  path="/billing"
  element={
    <RoleBasedRoute allowedRoles={["Admin", "Provider", "Nurse"]}>
      <BillingPage />
    </RoleBasedRoute>
  }
/>

<Route
  path="/notifications"
  element={
    <RoleBasedRoute allowedRoles={["Provider"]}>
      <NotificationsPage />
    </RoleBasedRoute>
  }
/>

          <Route
            path="/users"
            element={
              <Protected>
                <UserManagement />
              </Protected>
            }
          />
          <Route
            path="/settings"
            element={
              <Protected>
                <UserManagement />
              </Protected>
            }
          />
          <Route
            path="/settings/users"
            element={
              <Protected>
                <UserManagement />
              </Protected>
            }
          />
          <Route
            path="/patients"
            element={
              <Protected>
                <PatientList />
              </Protected>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <Protected>
                <PatientProfile />
              </Protected>
            }
          />
          <Route
            path="/appointments"
            element={
              <Protected>
                <AppointmentList />
              </Protected>
            }
          />
          <Route
            path="/calendar"
            element={
              <Protected>
                <AppointmentCalendar />
              </Protected>
            }
          />
          <Route
            path="/chat"
            element={
              <Protected>
                <ChatPage />
              </Protected>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;