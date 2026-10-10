import styled from "styled-components";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarRange,
  Pill,
  ReceiptText,
  UserRoundCog,
  Bell,
  MessageCircle,
  KeyRound,
  X,
} from "lucide-react";

import useAuth from "../../modules/auth/hooks/useAuth";
import "./Sidebar.css";

const SidebarContainer = styled.aside`
  width: 248px;
  flex: 0 0 248px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    height: 100dvh;
    z-index: 1101;
    box-shadow: ${({ $isOpen }) =>
      $isOpen ? "12px 0 36px rgba(15, 23, 42, 0.16)" : "none"};
    transform: ${({ $isOpen }) =>
      $isOpen ? "translateX(0)" : "translateX(-105%)"};
    transition: transform 0.28s ease;
  }
`;

const Overlay = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    z-index: 1100;
    cursor: pointer;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 18px 22px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;

  .sidebar-logo-mark {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    border-radius: 14px;
    color: ${({ theme }) => theme.colors.surface};
    background: ${({ theme }) => theme.colors.primary};
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.06em;
  }

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 18px;
    line-height: 1.2;
    font-weight: 750;
    letter-spacing: -0.035em;
  }

  p {
    margin: 4px 0 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const CloseButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 11px;
    color: ${({ theme }) => theme.colors.textSecondary};
    background: transparent;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.colors.textPrimary};
      background: ${({ theme }) => theme.colors.disabled};
    }
  }
`;

const SidebarContent = styled.div`
  padding: 22px 13px 18px;
`;

const SidebarSectionLabel = styled.p`
  margin: 0 10px 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SidebarLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;

  .sidebar-link-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.disabled};
    transform: translateX(2px);
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.disabled};
    border-color: ${({ theme }) => theme.colors.border};
    font-weight: 750;
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const SidebarFooter = styled.div`
  margin: 24px 3px 0;
  padding: 14px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.disabled};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 12px;
  }

  span {
    display: block;
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 11px;
    line-height: 1.45;
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
    allowedRoles.some((role) => userRoles.includes(role));

  const closeSidebar = () => onClose?.();

  return (
    <>
      <Overlay
        type="button"
        aria-label="Close navigation menu"
        $isOpen={isOpen}
        onClick={closeSidebar}
      />

      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <SidebarLogo>
            <div className="sidebar-logo-mark">H+</div>
            <div>
              <h2>Healthcare</h2>
              <p>Care management</p>
            </div>
          </SidebarLogo>

          <CloseButton
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
          >
            <X size={19} />
          </CloseButton>
        </SidebarHeader>

        <SidebarContent>
          <SidebarSectionLabel>
            Workspace
          </SidebarSectionLabel>

          <SidebarNav aria-label="Workspace navigation">
            <SidebarLink to="/dashboard" onClick={closeSidebar}>
              <LayoutDashboard className="sidebar-link-icon" />
              <span>Dashboard</span>
            </SidebarLink>

            {hasRole(["Provider", "Nurse"]) && (
              <SidebarLink to="/patients" onClick={closeSidebar}>
                <Users className="sidebar-link-icon" />
                <span>Patients</span>
              </SidebarLink>
            )}

            {hasRole(["Provider", "Nurse"]) && (
              <SidebarLink to="/appointments" onClick={closeSidebar}>
                <CalendarDays className="sidebar-link-icon" />
                <span>Appointments</span>
              </SidebarLink>
            )}

            {hasRole(["Provider", "Nurse", "Receptionist"]) && (
              <SidebarLink to="/calendar" onClick={closeSidebar}>
                <CalendarRange className="sidebar-link-icon" />
                <span>Calendar</span>
              </SidebarLink>
            )}

            {hasRole(["Provider", "Pharmacist"]) && (
              <SidebarLink to="/prescriptions" onClick={closeSidebar}>
                <Pill className="sidebar-link-icon" />
                <span>Prescriptions</span>
              </SidebarLink>
            )}

            {hasRole(["Admin", "Provider", "Nurse"]) && (
              <SidebarLink to="/billing" onClick={closeSidebar}>
                <ReceiptText className="sidebar-link-icon" />
                <span>Billing</span>
              </SidebarLink>
            )}

            {hasRole(["Admin"]) && (
              <SidebarLink to="/staff" onClick={closeSidebar}>
                <UserRoundCog className="sidebar-link-icon" />
                <span>Staff</span>
              </SidebarLink>
            )}

            {hasRole(["Provider"]) && (
              <SidebarLink to="/notifications" onClick={closeSidebar}>
                <Bell className="sidebar-link-icon" />
                <span>Notifications</span>
              </SidebarLink>
            )}

            {hasRole(["Admin", "Provider", "Nurse"]) && (
              <SidebarLink to="/chat" onClick={closeSidebar}>
                <MessageCircle className="sidebar-link-icon" />
                <span>Chat</span>
              </SidebarLink>
            )}
          </SidebarNav>

          {hasRole(["Admin"]) && (
            <>
              <SidebarSectionLabel className="sidebar-section-label--settings">
                Administration
              </SidebarSectionLabel>

              <SidebarNav aria-label="Administration navigation">
                <SidebarLink to="/settings" onClick={closeSidebar}>
                  <UserRoundCog className="sidebar-link-icon" />
                  <span>User management</span>
                </SidebarLink>
              </SidebarNav>
            </>
          )}

          <SidebarSectionLabel className="sidebar-section-label--settings">
            Account
          </SidebarSectionLabel>

          <SidebarNav aria-label="Account navigation">
            <SidebarLink to="/settings/change-password" onClick={closeSidebar}>
              <KeyRound className="sidebar-link-icon" />
              <span>Change password</span>
            </SidebarLink>
          </SidebarNav>

          <SidebarFooter>
            <strong>Healthcare workspace</strong>
            <span>
              Keep patient care and daily operations organized.
            </span>
          </SidebarFooter>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
}

export default Sidebar;