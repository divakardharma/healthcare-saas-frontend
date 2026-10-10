
import { useSelector } from "react-redux";
import { Menu, Wifi, WifiOff, RefreshCw, UserRound } from "lucide-react";
import styled from "styled-components";

import useAuth from "../../modules/auth/hooks/useAuth";
import useTenant from "../../modules/tenant/hooks/useTenant";
import "./Header.css";

// Styled-components: dynamic online/offline status mattum
const OfflineBadge = styled.span`
  background: ${({ $isOnline }) =>
    $isOnline ? "#16a34a12" : "#d9770612"};

  color: ${({ $isOnline }) =>
    $isOnline ? "#15803d" : "#b45309"};

  border-color: ${({ $isOnline }) =>
    $isOnline ? "#16a34a40" : "#d9770640"};
`;

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const {
    isOnline,
    offlineQueue,
    isProcessingQueue,
  } = useSelector((state) => state.offline);

  const queueCount = offlineQueue?.length || 0;
  const displayName = user?.name || user?.email || "User";
  const tenantName =
    tenant?.name || tenant?.subdomain || "Tenant";

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-button"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <Menu size={21} />
        </button>

        <div className="header-title-section">
          <h2 className="header-title">Healthcare SaaS</h2>
          <span className="tenant-name" title={tenantName}>
            {tenantName}
          </span>
        </div>
      </div>

      <div className="header-right">
        <OfflineBadge
          className="offline-badge"
          $isOnline={isOnline}
          role="status"
          aria-live="polite"
        >
          {isOnline ? (
            <Wifi className="status-icon" />
          ) : (
            <WifiOff className="status-icon" />
          )}

          <span>{isOnline ? "Online" : "Offline"}</span>

          {queueCount > 0 && (
            <span className="queue-info">
              {isProcessingQueue ? (
                <RefreshCw className="queue-icon queue-icon--syncing" />
              ) : (
                <span className="queue-dot" />
              )}

              {queueCount} queued
            </span>
          )}
        </OfflineBadge>

        <div className="header-user">
          <div className="header-user-avatar">
            <UserRound size={19} />
          </div>

          <div className="header-user-details">
            <span className="header-user-name" title={displayName}>
              {displayName}
            </span>
            <span className="header-user-label">Signed in</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

