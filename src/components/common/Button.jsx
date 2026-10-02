import styled from "styled-components";

const StyledButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};

  transition: 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
}) {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
}

export default Button;