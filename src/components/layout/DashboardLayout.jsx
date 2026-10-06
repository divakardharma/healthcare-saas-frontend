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
  display: flex;
  flex-direction: column;
  overflow: ${({ $noScroll }) => ($noScroll ? "hidden" : "auto")};
  padding: ${({ $noPadding }) => ($noPadding ? "12px 16px" : "24px")};

  @media (max-width: 768px) {
    padding: ${({ $noPadding }) => ($noPadding ? "8px 12px" : "16px")};
  }
`;

function DashboardLayout({ children, noPadding = false, noScroll = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const shouldNoScroll = noPadding || noScroll;

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

        <Content $noPadding={noPadding} $noScroll={shouldNoScroll}>
          {children}
        </Content>
      </Main>
    </Layout>
  );
}

export default DashboardLayout;