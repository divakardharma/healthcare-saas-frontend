import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { Loader, EmptyState } from "../../components/common";
import useChat from "../../modules/chat/hooks/useChat";
import useAuth from "../../modules/auth/hooks/useAuth";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const PageTitle = styled.h1`
  margin: 0 0 12px;
  font-size: 22px;
  flex: none;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const ChatShell = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
`;

const UserList = styled.aside`
  width: 280px;
  flex: none;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: ${({ theme }) => theme.colors.surface};

  @media (max-width: 768px) {
    width: ${({ $hasSelection }) => ($hasSelection ? "0" : "100%")};
    border-right: none;
    overflow: hidden;
  }
`;

const UserListHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  font-size: 16px;
  flex: none;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 15px;
  }
`;

const UserListBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const UserItem = styled.button`
  width: 100%;
  text-align: left;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.disabled : "transparent"};
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: ${({ theme }) => theme.colors.disabled};
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const UserRoles = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Conversation = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  @media (max-width: 768px) {
    display: ${({ $hasSelection }) => ($hasSelection ? "flex" : "none")};
  }
`;

const ConversationHeader = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  flex: none;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const BackButton = styled.button`
  display: none;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0 4px;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 10px;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const BubbleRow = styled.div`
  display: flex;
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  align-items: center;
  gap: 4px;
`;

const BubbleWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 75%;

  @media (max-width: 768px) {
    max-width: 85%;
  }
`;

const Bubble = styled.div`
  padding: 10px 14px;
  border-radius: 12px;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.primary : theme.colors.surface};
  color: ${({ $mine, theme }) =>
    $mine ? theme.colors.surface : theme.colors.textPrimary};
  border: ${({ $mine, theme }) =>
    $mine ? "none" : `1px solid ${theme.colors.border}`};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  word-break: break-word;

  ${({ $deleted }) =>
    $deleted &&
    `
    opacity: 0.7;
    font-style: italic;
  `}
`;

const BubbleMeta = styled.div`
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.8;
  text-align: ${({ $mine }) => ($mine ? "right" : "left")};
`;

const ThreeDotsBtn = styled.button`
  position: absolute;
  ${({ $mine }) => ($mine ? "left: -30px;" : "right: -30px;")}
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 2;
  font-size: 16px;
  color: #6b7280;
  padding: 0;

  ${BubbleWrapper}:hover & {
    opacity: 1;
  }

  &:hover {
    background: #f3f4f6;
  }

  @media (max-width: 768px) {
    ${({ $mine }) => ($mine ? "left: -26px;" : "right: -26px;")}
    width: 24px;
    height: 24px;
    font-size: 14px;
    opacity: 1; /* always visible on mobile */
  }
`;

const Composer = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  flex: none;

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const ComposerInput = styled.input`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 10px 12px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SendButton = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0 18px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  @media (max-width: 768px) {
    padding: 0 14px;
  }
`;

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.background};
`;

const ErrorBanner = styled.div`
  padding: 8px 16px;
  background: #fef2f2;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
  flex: none;
`;

/* ===== Delete Menu ===== */
const DeleteMenuOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DeleteMenu = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  width: 260px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 90%;
    max-width: 280px;
  }
`;

const DeleteMenuHeader = styled.div`
  padding: 14px 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DeleteMenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border: none;
  background: transparent;
  font-size: 15px;
  cursor: pointer;
  color: ${({ $danger, $orange }) =>
    $danger ? "#ef4444" : $orange ? "#f97316" : "#374151"};

  &:hover {
    background: #f9fafb;
  }
`;

const DeleteMenuCancel = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border: none;
  border-top: 1px solid #f3f4f6;
  background: transparent;
  font-size: 15px;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    background: #f9fafb;
  }
`;

function formatTime(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

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
  const [menuMessage, setMenuMessage] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (id) => {
    selectUser(id);
  };

  const handleBack = () => {
    selectUser(null);
  };

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

  const closeDeleteMenu = () => {
    setMenuMessage(null);
  };

  const handleDelete = (deleteType) => {
    if (!menuMessage) return;
    deleteMessage(menuMessage.id, deleteType, selectedUserId);
    closeDeleteMenu();
  };

  const isMyMessage = (message) => {
    return myId != null && Number(message.sender_user_id) === Number(myId);
  };

  return (
    <DashboardLayout noPadding>
      <PageWrapper>
        <PageTitle>Chat</PageTitle>

        <ChatShell>
          <UserList $hasSelection={!!selectedUserId}>
            <UserListHeader>Staff</UserListHeader>
            <UserListBody>
              {loadingUsers && (
                <div style={{ padding: 24 }}>
                  <Loader />
                </div>
              )}

              {!loadingUsers && users.length === 0 && (
                <div style={{ padding: 16 }}>
                  <EmptyState message="No staff available to chat" />
                </div>
              )}

              {!loadingUsers &&
                users
                  .filter((u) => myId == null || Number(u.id) !== Number(myId))
                  .map((u) => (
                    <UserItem
                      key={u.id}
                      type="button"
                      $active={selectedUserId === u.id}
                      onClick={() => handleSelect(u.id)}
                    >
                      <UserName>{u.name || `User #${u.id}`}</UserName>
                      <UserRoles>
                        {Array.isArray(u.roles) && u.roles.length
                          ? u.roles.join(", ")
                          : "Staff"}
                      </UserRoles>
                    </UserItem>
                  ))}
            </UserListBody>
          </UserList>

          <Conversation $hasSelection={!!selectedUserId}>
            {!selectedUserId ? (
              <Placeholder>Select a staff member to start chatting</Placeholder>
            ) : (
              <>
                <ConversationHeader>
                  <BackButton type="button" onClick={handleBack} aria-label="Back">
                    ←
                  </BackButton>
                  <div>
                    <div>
                      {selectedUser?.name || `User #${selectedUserId}`}
                    </div>
                    {selectedUser?.roles?.length > 0 && (
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          color: "#6b7280",
                        }}
                      >
                        {selectedUser.roles.join(", ")}
                      </div>
                    )}
                  </div>
                </ConversationHeader>

                {(error || sendError) && (
                  <ErrorBanner>{error || sendError}</ErrorBanner>
                )}

                <MessagesArea>
                  {loadingMessages && <Loader />}

                  {!loadingMessages && messages.length === 0 && (
                    <Placeholder style={{ background: "transparent" }}>
                      No messages yet. Say hello.
                    </Placeholder>
                  )}

                  {!loadingMessages &&
                    messages.map((m) => {
                      const mine = isMyMessage(m);
                      const isDeleted = m.is_deleted;

                      return (
                        <BubbleRow key={m.id} $mine={mine}>
                          <BubbleWrapper>
                            <Bubble $mine={mine} $deleted={isDeleted}>
                              <div>
                                {isDeleted
                                  ? "This message was deleted"
                                  : m.message}
                              </div>
                              <BubbleMeta $mine={mine}>
                                {!mine && m.sender_name
                                  ? `${m.sender_name} · `
                                  : ""}
                                {formatTime(m.created_at)}
                              </BubbleMeta>
                            </Bubble>

                            {!isDeleted && (
                              <ThreeDotsBtn
                                type="button"
                                $mine={mine}
                                onClick={(e) => openDeleteMenu(m, e)}
                                title="More options"
                              >
                                ⋮
                              </ThreeDotsBtn>
                            )}
                          </BubbleWrapper>
                        </BubbleRow>
                      );
                    })}
                  <div ref={bottomRef} />
                </MessagesArea>

                <Composer onSubmit={handleSend}>
                  <ComposerInput
                    type="text"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={sending}
                    autoComplete="off"
                  />
                  <SendButton type="submit" disabled={sending || !text.trim()}>
                    {sending ? "…" : "Send"}
                  </SendButton>
                </Composer>
              </>
            )}
          </Conversation>
        </ChatShell>
      </PageWrapper>

      {menuMessage && (
        <DeleteMenuOverlay onClick={closeDeleteMenu}>
          <DeleteMenu onClick={(e) => e.stopPropagation()}>
            <DeleteMenuHeader>Delete Message</DeleteMenuHeader>

            <DeleteMenuItem $orange onClick={() => handleDelete("me")}>
              <span>🚫</span> Delete for me
            </DeleteMenuItem>

            {isMyMessage(menuMessage) && (
              <DeleteMenuItem $danger onClick={() => handleDelete("everyone")}>
                <span>🗑️</span> Delete for everyone
              </DeleteMenuItem>
            )}

            <DeleteMenuCancel onClick={closeDeleteMenu}>
              <span>✕</span> Cancel
            </DeleteMenuCancel>
          </DeleteMenu>
        </DeleteMenuOverlay>
      )}
    </DashboardLayout>
  );
}

export default ChatPage;