import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { Loader, EmptyState } from "../../components/common";
import useChat from "../../modules/chat/hooks/useChat";
import useAuth from "../../modules/auth/hooks/useAuth";

import "./ChatPage.css";

/*
 * The ONLY styled-component in this page.
 * It turns the tenant theme into CSS variables; everything else
 * (layout, spacing, responsive rules) lives in ChatPage.css and
 * reads these variables, so tenant colours still apply.
 */
const ChatTheme = styled.div`
  --chat-primary: ${({ theme }) => theme.colors.primary};
  --chat-primary-hover: ${({ theme }) => theme.colors.primaryHover};
  --chat-primary-soft: color-mix(
    in srgb,
    ${({ theme }) => theme.colors.primary} 12%,
    transparent
  );
  --chat-on-primary: ${({ theme }) => theme.colors.surface};
  --chat-surface: ${({ theme }) => theme.colors.surface};
  --chat-background: ${({ theme }) => theme.colors.background};
  --chat-border: ${({ theme }) => theme.colors.border};
  --chat-input-border: ${({ theme }) => theme.colors.inputBorder};
  --chat-hover: ${({ theme }) => theme.colors.disabled};
  --chat-text: ${({ theme }) => theme.colors.textPrimary};
  --chat-muted: ${({ theme }) => theme.colors.textSecondary};
  --chat-danger: ${({ theme }) => theme.colors.danger};
  --chat-radius: ${({ theme }) => theme.borderRadius.medium};
`;

/* ---------- helpers ---------- */

const CHAT_ROLES = ["Admin", "Provider", "Nurse"];

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2);

  return parts[0][0] + parts[parts.length - 1][0];
}

function dayKey(value) {
  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? "" : d.toDateString();
}

function formatDayLabel(value) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatClock(value) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ name, small = false }) {
  return (
    <span className={`chat-avatar${small ? " chat-avatar--sm" : ""}`}>
      {getInitials(name)}
    </span>
  );
}

function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

/* ---------- page ---------- */

function ChatPage() {
  const { user } = useAuth();
  const myId = user?.id || user?.user_id || null;

  const {
    users,
    messages,
    selectedUserId,
    selectedUser,
    loadingUsers,
    loadingMessages,
    sending,
    error,
    sendError,
    fetchUsers,
    selectUser,
    sendMessage,
    deleteMessage,
  } = useChat();

  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [menuMessage, setMenuMessage] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Only Admin, Provider, and Nurse can appear in Staff Chat.
  const chatUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((u) => myId == null || Number(u.id) !== Number(myId))
      .filter(
        (u) =>
          Array.isArray(u.roles) &&
          u.roles.some((role) => CHAT_ROLES.includes(role))
      )
      .filter(
        (u) =>
          !query ||
          String(u.name || "").toLowerCase().includes(query)
      );
  }, [users, myId, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Focus the composer when a conversation opens (desktop only).
  useEffect(() => {
    if (selectedUserId && window.matchMedia("(min-width: 769px)").matches) {
      inputRef.current?.focus();
    }
  }, [selectedUserId]);

  // Close the delete menu with Escape.
  useEffect(() => {
    if (!menuMessage) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") setMenuMessage(null);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [menuMessage]);

  const isMyMessage = (message) =>
    myId != null && Number(message.sender_user_id) === Number(myId);

  const handleSend = (e) => {
    e.preventDefault();

    const trimmed = text.trim();

    if (!trimmed || !selectedUserId || sending) return;

    sendMessage(selectedUserId, trimmed);
    setText("");
  };

  const openDeleteMenu = (message, e) => {
    e.stopPropagation();
    setMenuMessage(message);
  };

  const closeDeleteMenu = () => setMenuMessage(null);

  const handleDelete = (deleteType) => {
    if (!menuMessage) return;

    deleteMessage(menuMessage.id, deleteType, selectedUserId);
    closeDeleteMenu();
  };

  const hasSelection = Boolean(selectedUserId);
  const selectedName = selectedUser?.name || `User #${selectedUserId}`;

  const renderMessages = () => {
    let previous = null;

    return messages.map((m) => {
      const mine = isMyMessage(m);
      const isDeleted = Boolean(m.is_deleted);
      const sameDay = previous && dayKey(previous.created_at) === dayKey(m.created_at);
      const grouped =
        sameDay && Number(previous.sender_user_id) === Number(m.sender_user_id);

      const showDay = !sameDay;

      previous = m;

      return (
        <div key={m.id} style={{ display: "contents" }}>
          {showDay && (
            <div className="chat-day">{formatDayLabel(m.created_at)}</div>
          )}

          <div
            className={
              "chat-row" +
              (mine ? " chat-row--mine" : "") +
              (grouped ? " chat-row--grouped" : "")
            }
          >
            <div className="chat-bubble-wrap">
              <div
                className={
                  "chat-bubble" + (isDeleted ? " chat-bubble--deleted" : "")
                }
              >
                <div>{isDeleted ? "This message was deleted" : m.message}</div>
                <div className="chat-bubble__time">
                  {formatClock(m.created_at)}
                </div>
              </div>

              {!isDeleted && (
                <button
                  type="button"
                  className="chat-more"
                  onClick={(e) => openDeleteMenu(m, e)}
                  title="More options"
                  aria-label="More options"
                >
                  ⋮
                </button>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <DashboardLayout noPadding>
      <ChatTheme
        className={`chat-page${hasSelection ? " chat-page--selected" : ""}`}
      >
        <h1 className="chat-title">Chat</h1>

        <div className={`chat-shell${hasSelection ? " chat-shell--selected" : ""}`}>
          {/* ===== Staff list ===== */}
          <aside className="chat-sidebar">
            <div className="chat-sidebar__header">
              <h2 className="chat-sidebar__title">Staff</h2>

              <input
                type="search"
                className="chat-search"
                placeholder="Search staff…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search staff"
              />
            </div>

            <div className="chat-sidebar__body">
              {loadingUsers && (
                <div className="chat-sidebar__state">
                  <Loader />
                </div>
              )}

              {!loadingUsers && chatUsers.length === 0 && (
                <div className="chat-sidebar__state">
                  <EmptyState
                    message={
                      search
                        ? "No staff match your search"
                        : "No staff available to chat"
                    }
                  />
                </div>
              )}

              {!loadingUsers &&
                chatUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={
                      "chat-user" +
                      (selectedUserId === u.id ? " chat-user--active" : "")
                    }
                    onClick={() => selectUser(u.id)}
                  >
                    <Avatar name={u.name || `U${u.id}`} />

                    <span className="chat-user__info">
                      <span className="chat-user__name">
                        {u.name || `User #${u.id}`}
                      </span>

                      <span className="chat-user__roles">
                        {Array.isArray(u.roles) && u.roles.length
                          ? u.roles.join(", ")
                          : "Staff"}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </aside>

          {/* ===== Conversation ===== */}
          <section className="chat-conversation">
            {!hasSelection ? (
              <div className="chat-placeholder">
                <div className="chat-placeholder__icon">💬</div>
                <strong>Your messages</strong>
                <span>Select a staff member to start chatting</span>
              </div>
            ) : (
              <>
                <header className="chat-conversation__header">
                  <button
                    type="button"
                    className="chat-back"
                    onClick={() => selectUser(null)}
                    aria-label="Back to staff list"
                  >
                    ←
                  </button>

                  <Avatar name={selectedName} small />

                  <div>
                    <div className="chat-conversation__name">
                      {selectedName}
                    </div>

                    {selectedUser?.roles?.length > 0 && (
                      <div className="chat-conversation__roles">
                        {selectedUser.roles.join(", ")}
                      </div>
                    )}
                  </div>
                </header>

                {(error || sendError) && (
                  <div className="chat-error">{error || sendError}</div>
                )}

                <div className="chat-messages">
                  {loadingMessages && <Loader />}

                  {!loadingMessages && messages.length === 0 && (
                    <div className="chat-placeholder" style={{ background: "transparent" }}>
                      <div className="chat-placeholder__icon">👋</div>
                      <span>No messages yet. Say hello.</span>
                    </div>
                  )}

                  {!loadingMessages && renderMessages()}

                  <div ref={bottomRef} />
                </div>

                <form className="chat-composer" onSubmit={handleSend}>
                  <input
                    ref={inputRef}
                    type="text"
                    className="chat-composer__input"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={sending}
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    className="chat-send"
                    disabled={sending || !text.trim()}
                    aria-label="Send message"
                  >
                    <SendIcon />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>

        {/* ===== Delete menu ===== */}
        {menuMessage && (
          <div className="chat-overlay" onClick={closeDeleteMenu}>
            <div className="chat-menu" onClick={(e) => e.stopPropagation()}>
              <div className="chat-menu__header">Delete Message</div>

              <button
                type="button"
                className="chat-menu__item chat-menu__item--warn"
                onClick={() => handleDelete("me")}
              >
                <span>🚫</span>
                Delete for me
              </button>

              {isMyMessage(menuMessage) && (
                <button
                  type="button"
                  className="chat-menu__item chat-menu__item--danger"
                  onClick={() => handleDelete("everyone")}
                >
                  <span>🗑️</span>
                  Delete for everyone
                </button>
              )}

              <button
                type="button"
                className="chat-menu__item chat-menu__item--cancel"
                onClick={closeDeleteMenu}
              >
                <span>✕</span>
                Cancel
              </button>
            </div>
          </div>
        )}
      </ChatTheme>
    </DashboardLayout>
  );
}

export default ChatPage;