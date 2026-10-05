import styled from "styled-components";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";

const Layout = styled.div`
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const HeaderSlot = styled.div`
  flex: none;
`;

const Content = styled.main`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
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
        <HeaderSlot>
          <Header
            onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          />
        </HeaderSlot>

        <Content>{children}</Content>
      </Main>
    </Layout>
  );
}

export default DashboardLayout;