import React from "react";
import styled from "styled-components";

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 8px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorText>Please refresh the page and try again.</ErrorText>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;