import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
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