import styled from "styled-components";

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const StyledInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  outline: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  autoComplete,
  ...props
}) {
  return (
    <InputWrapper>
      {label && <Label htmlFor={name}>{label}</Label>}

     <StyledInput
  id={name}
  name={name}
  type={type}
  value={value}
  onChange={onChange}
  placeholder={placeholder}
  disabled={disabled}
  required={required}
  autoComplete={autoComplete}
  {...props}
/>
    </InputWrapper>
  );
}

export default Input;