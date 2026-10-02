import styled from "styled-components";
import useAuth from "../../modules/auth/hooks/useAuth";
import useTenant from "../../modules/tenant/hooks/useTenant";

const HeaderContainer = styled.header`
  height: 70px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 24px;
  box-sizing: border-box;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderTitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TenantName = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const HeaderUser = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MenuButton = styled.button`
  display: none;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    display: inline-block;
  }
`;

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { tenant } = useTenant();

  return (
    <HeaderContainer>
      <HeaderLeft>
        <MenuButton onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </MenuButton>

        <HeaderTitleSection>
          <HeaderTitle>Healthcare SaaS</HeaderTitle>

          <TenantName>
            {tenant?.name || tenant?.subdomain || "Tenant"}
          </TenantName>
        </HeaderTitleSection>
      </HeaderLeft>

      <HeaderUser>
        {user?.name || user?.email || "User"}
      </HeaderUser>
    </HeaderContainer>
  );
}

export default Header;