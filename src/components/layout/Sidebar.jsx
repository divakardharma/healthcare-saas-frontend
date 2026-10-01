import styled from "styled-components";
import { NavLink } from "react-router-dom";

const SidebarContainer = styled.aside`
  width: 240px;
  min-height: 100vh;
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
      $isOpen ? "translateX(0)" : "translateX(-100%)"};

    transition: transform 0.3s ease;
  }
`;
const SidebarLogo = styled.div`
  margin-bottom: 30px;

  h2 {
    margin: 0;
    font-size: 22px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
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
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:hover {
    background: ${({ theme }) => theme.colors.disabled};
  }

  &.active {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    font-weight: 600;
  }
`;

function Sidebar({ isOpen, onClose }) {
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
  <SidebarLink to="/dashboard" onClick={onClose}>
    Dashboard
  </SidebarLink>

  <SidebarLink to="/patients" onClick={onClose}>
    Patients
  </SidebarLink>

  <SidebarLink to="/appointments" onClick={onClose}>
    Appointments
  </SidebarLink>

  <SidebarLink to="/calendar" onClick={onClose}>
    Calendar
  </SidebarLink>

  <SidebarLink to="/prescriptions" onClick={onClose}>
    Prescriptions
  </SidebarLink>

  <SidebarLink to="/billing" onClick={onClose}>
    Billing
  </SidebarLink>

  <SidebarLink to="/staff" onClick={onClose}>
    Staff
  </SidebarLink>

  <SidebarLink to="/settings" onClick={onClose}>
    Settings
  </SidebarLink>
</SidebarNav>
    </SidebarContainer>
  </>
);
}

export default Sidebar;