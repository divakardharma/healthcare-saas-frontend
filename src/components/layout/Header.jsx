import styled from "styled-components";
import useAuth from "../../modules/auth/hooks/useAuth";

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
const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textPrimary};
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

  return (
    <HeaderContainer>
<HeaderLeft>
  <MenuButton onClick={onMenuClick} aria-label="Toggle menu">
    ☰
  </MenuButton>

  <HeaderTitle>Healthcare SaaS</HeaderTitle>
</HeaderLeft>

      <HeaderUser>
        {user?.name || user?.email || "User"}
      </HeaderUser>
    </HeaderContainer>
  );
}
export default Header;