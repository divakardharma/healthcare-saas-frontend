import styled from "styled-components";
import Button from "./Button";

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

function FormActions({
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  disabled = false,
}) {
  return (
    <Actions>
      <Button type="button" onClick={onCancel}>
        {cancelText}
      </Button>

      <Button type="submit" onClick={onSubmit} disabled={disabled}>
        {submitText}
      </Button>
    </Actions>
  );
}

export default FormActions;