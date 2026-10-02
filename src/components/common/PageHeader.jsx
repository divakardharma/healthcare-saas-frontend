import styled from "styled-components";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function PageHeader({ title, description, action }) {
  return (
    <Header>
      <TitleSection>
        <Title>{title}</Title>

        {description && <Description>{description}</Description>}
      </TitleSection>

      {action && action}
    </Header>
  );
}

export default PageHeader;