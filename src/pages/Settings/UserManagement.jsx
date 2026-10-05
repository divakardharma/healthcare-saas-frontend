import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  Button,
  Card,
  ConfirmModal,
  Input,
  Loader,
  Modal,
  PageHeader,
  Table,
} from "../../components/common";

import RoleBasedRoute from "../../routes/RoleBasedRoute";
import useUsers from "../../modules/users/hooks/useUsers";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const RoleRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const RoleTag = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  background: ${({ theme }) =>
    theme.colors.disabled};

  color: ${({ theme }) =>
    theme.colors.textPrimary};

  font-size: 12px;
`;

const ErrorText = styled.div`
  color: ${({ theme }) =>
    theme.colors.danger};

  margin-bottom: 14px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const roles = [
  "Admin",
  "Provider",
  "Nurse",
  "Patient",
  "Pharmacist",
];

function UserManagementContent() {
  const navigate = useNavigate();

  const {
    users,
    loading,
    actionLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    assignRole,
    removeRole,
    deleteUser,
  } = useUsers();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [deleteId, setDeleteId] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient",
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "Patient",
    });

    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role:
        user.roles?.[0] || "Patient",
    });

    setModalOpen(true);
  };

  const submit = (event) => {
    event.preventDefault();

    if (editing) {
      const data = {
        name: form.name,
        email: form.email,
      };

      if (form.password) {
        data.password = form.password;
      }

      updateUser(editing.id, data);

      if (
        form.role &&
        !editing.roles?.includes(form.role)
      ) {
        assignRole(
          editing.id,
          form.role
        );
      }
    } else {
      createUser(form);
    }

    setModalOpen(false);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
    },

    {
      key: "name",
      label: "Name",
    },

    {
      key: "email",
      label: "Email",
    },

    {
      key: "roles",
      label: "Roles",

      render: (row) => (
        <RoleRow>
          {(row.roles || []).map(
            (role) => (
              <RoleTag key={role}>
                {role}
              </RoleTag>
            )
          )}
        </RoleRow>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (row) => (
        <ButtonRow>
          <Button
            onClick={() =>
              openEdit(row)
            }
          >
            Edit
          </Button>

          {(row.roles || []).map(
            (role) => (
              <Button
                key={`${row.id}-${role}`}
                onClick={() =>
                  removeRole(
                    row.id,
                    role
                  )
                }
              >
                Remove {role}
              </Button>
            )
          )}

          <Button
            onClick={() =>
              setDeleteId(row.id)
            }
          >
            Delete
          </Button>
        </ButtonRow>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="User & Role Management"
        description="Admin-only management of tenant users and roles."
        action={
          <Button onClick={openCreate}>
            Add User
          </Button>
        }
      />

      {error && (
        <ErrorText>{error}</ErrorText>
      )}

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={users}
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        title={
          editing
            ? "Edit User"
            : "Create User"
        }
        onClose={() =>
          setModalOpen(false)
        }
      >
        <Form onSubmit={submit}>
          <Grid>
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
              disabled={actionLoading}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
              disabled={actionLoading}
            />

            <Input
              label={
                editing
                  ? "New Password (optional)"
                  : "Password"
              }
              name="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required={!editing}
              disabled={actionLoading}
            />

            <label>
              Role

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
                disabled={actionLoading}
              >
                {roles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </Grid>

          <Actions>
            <Button
              type="button"
              onClick={() =>
                setModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={actionLoading}
            >
              {actionLoading
                ? "Saving..."
                : "Save"}
            </Button>
          </Actions>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete User"
        message="Delete this user from the tenant?"
        onCancel={() =>
          setDeleteId(null)
        }
        onConfirm={() => {
          deleteUser(deleteId);
          setDeleteId(null);
        }}
      />

      <Button
        onClick={() =>
          navigate("/dashboard")
        }
      >
        Back to Dashboard
      </Button>
    </DashboardLayout>
  );
}

export default function UserManagement() {
  return (
    <RoleBasedRoute
      allowedRoles={["Admin"]}
    >
      <UserManagementContent />
    </RoleBasedRoute>
  );
}