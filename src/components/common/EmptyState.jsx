import styled from "styled-components";

const Container = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Message = styled.p`
  margin: 0;
  font-size: 14px;
`;

function EmptyState({ message = "No data available" }) {
  return (
    <Container>
      <Message>{message}</Message>
    </Container>
  );
}

export default EmptyState;