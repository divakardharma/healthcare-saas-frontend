import styled from "styled-components";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
`;

const Content = styled.main`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Layout>
      <Sidebar
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
/>

      <Main>
        <Header
  onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
/>

        <Content>{children}</Content>
      </Main>
    </Layout>
  );
}

export default DashboardLayout;