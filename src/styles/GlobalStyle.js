import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* Tenant theme exposed as CSS variables, so plain .css files
     (UserManagement.css, ChangePassword.css, ...) follow the tenant theme */
  :root {
    --color-primary: ${({ theme }) => theme.colors.primary};
    --color-primary-hover: ${({ theme }) => theme.colors.primaryHover};
    --color-background: ${({ theme }) => theme.colors.background};
    --color-surface: ${({ theme }) => theme.colors.surface};
    --color-text: ${({ theme }) => theme.colors.textPrimary};
    --color-text-secondary: ${({ theme }) => theme.colors.textSecondary};
    --color-border: ${({ theme }) => theme.colors.border};
    --color-input-border: ${({ theme }) => theme.colors.inputBorder};
    --color-disabled: ${({ theme }) => theme.colors.disabled};
    --color-danger: ${({ theme }) => theme.colors.danger};
    --color-success: ${({ theme }) => theme.colors.success};
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
`;

export default GlobalStyle;