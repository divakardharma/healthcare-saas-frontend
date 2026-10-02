import styled from "styled-components";

const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 20px;
`;

function Card({ children }) {
  return <StyledCard>{children}</StyledCard>;
}

export default Card;