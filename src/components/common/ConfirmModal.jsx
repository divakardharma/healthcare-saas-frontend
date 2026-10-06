import styled from "styled-components";

import Modal from "./Modal";
import Button from "./Button";

const Message = styled.p`
  margin: 0 0 24px;

  font-size: 15px;
  line-height: 1.6;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;

  margin-top: 8px;
`;

const CancelButton = styled(Button)`
  background: ${({ theme }) => theme.colors.disabled};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    opacity: 0.9;
  }
`;

const ConfirmButton = styled(Button)`
  background: ${({ theme }) => theme.colors.danger};
  color: #ffffff;

  &:hover {
    opacity: 0.9;
  }
`;

function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
    >
      <Message>{message}</Message>

      <Actions>
        <CancelButton onClick={onCancel}>
          Cancel
        </CancelButton>

        <ConfirmButton onClick={onConfirm}>
          Confirm
        </ConfirmButton>
      </Actions>
    </Modal>
  );
}

export default ConfirmModal;