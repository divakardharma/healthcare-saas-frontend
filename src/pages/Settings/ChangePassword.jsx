import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

const PageContainer = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;

  h2 {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 600px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 28px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};

  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px
      ${({ theme }) => `${theme.colors.primary}22`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 44px;

  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};

  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  margin-bottom: 20px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;

  background: ${({ $error }) =>
    $error ? "#fee2e2" : "#dcfce7"};

  color: ${({ $error }) =>
    $error ? "#b91c1c" : "#15803d"};
`;

const ChangePassword = () => {
  const dispatch = useDispatch();

  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [validationError, setValidationError] =
    useState("");

  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setValidationError("");
    setSuccess("");

    if (
      !form.current_password ||
      !form.new_password ||
      !form.confirm_password
    ) {
      setValidationError(
        "Please fill in all password fields."
      );
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setValidationError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (form.current_password === form.new_password) {
      setValidationError(
        "New password must be different from current password."
      );
      return;
    }

    dispatch({
      type: "auth/changePasswordRequest",
      payload: {
        current_password: form.current_password,
        new_password: form.new_password,
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader>
        <h2>Change Password</h2>
        <p>
          Update your account password to keep your
          account secure.
        </p>
      </PageHeader>

      <Card>
        {(validationError || error) && (
          <Message $error>
            {validationError || error}
          </Message>
        )}

        {success && (
          <Message>
            {success}
          </Message>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="current_password">
              Current Password
            </Label>

            <Input
              id="current_password"
              type="password"
              name="current_password"
              value={form.current_password}
              onChange={handleChange}
              placeholder="Enter current password"
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="new_password">
              New Password
            </Label>

            <Input
              id="new_password"
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="Enter new password"
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirm_password">
              Confirm New Password
            </Label>

            <Input
              id="confirm_password"
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Confirm new password"
              disabled={loading}
            />
          </FormGroup>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Changing Password..."
              : "Change Password"}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};

export default ChangePassword;