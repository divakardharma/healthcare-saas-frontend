import styled from "styled-components";
import { NavLink } from "react-router-dom";
import useAuth from "../../modules/auth/hooks/useAuth";

const SidebarContainer = styled.aside`
  width: 240px;
  flex: none;
  height: 100%;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 240px;
    height: 100vh;
    z-index: 1100;

    transform: ${({ $isOpen }) =>
      $isOpen
        ? "translateX(0)"
        : "translateX(-100%)"};

    transition: transform 0.3s ease;
  }
`;

const SidebarLogo = styled.div`
  margin-bottom: 30px;

  h2 {
    margin: 0;
    font-size: 22px;
    color: ${({ theme }) =>
      theme.colors.textPrimary};
  }
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) =>
      $isOpen ? "block" : "none"};

    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SidebarLink = styled(NavLink)`
  text-decoration: none;

  color: ${({ theme }) =>
    theme.colors.textSecondary};

  padding: 10px 12px;

  border-radius: ${({ theme }) =>
    theme.borderRadius.small};

  &:hover {
    background: ${({ theme }) =>
      theme.colors.disabled};
  }

  &.active {
    background: ${({ theme }) =>
      theme.colors.primary};

    color: ${({ theme }) =>
      theme.colors.surface};

    font-weight: 600;
  }
`;

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
      ? [user.role]
      : [];

  const hasRole = (allowedRoles) =>
    allowedRoles.some((role) =>
      userRoles.includes(role)
    );

  return (
    <>
      <Overlay
        $isOpen={isOpen}
        onClick={onClose}
      />

      <SidebarContainer $isOpen={isOpen}>
        <SidebarLogo>
          <h2>Healthcare</h2>
        </SidebarLogo>

        <SidebarNav>
          {/* Common */}
          <SidebarLink
            to="/dashboard"
            onClick={onClose}
          >
            Dashboard
          </SidebarLink>

          {/* Module 3 - Patient Management */}
          {hasRole([
            "Provider",
            "Nurse",
          ]) && (
            <SidebarLink
              to="/patients"
              onClick={onClose}
            >
              Patients
            </SidebarLink>
          )}

          {/* Module 4 - Appointment Management */}
          {hasRole([
            "Provider",
            "Nurse",
          ]) && (
            <SidebarLink
              to="/appointments"
              onClick={onClose}
            >
              Appointments
            </SidebarLink>
          )}

          {/* Module 10 - Calendar */}
          {hasRole([
            "Provider",
            "Nurse",
            "Receptionist",
          ]) && (
            <SidebarLink
              to="/calendar"
              onClick={onClose}
            >
              Calendar
            </SidebarLink>
          )}

          {/* Existing modules - untouched */}
          <SidebarLink
            to="/prescriptions"
            onClick={onClose}
          >
            Prescriptions
          </SidebarLink>

          <SidebarLink
            to="/billing"
            onClick={onClose}
          >
            Billing
          </SidebarLink>

          <SidebarLink
            to="/staff"
            onClick={onClose}
          >
            Staff
          </SidebarLink>

          {/* Staff Chat */}
          {hasRole([
            "Admin",
            "Provider",
            "Nurse",
          ]) && (
            <SidebarLink
              to="/chat"
              onClick={onClose}
            >
              Chat
            </SidebarLink>
          )}

          {/* Module 2 - User & Role Management */}
          {hasRole(["Admin"]) && (
            <SidebarLink
              to="/settings"
              onClick={onClose}
            >
              Settings
            </SidebarLink>
          )}
        </SidebarNav>
      </SidebarContainer>
    </>
  );
}

export default Sidebar;