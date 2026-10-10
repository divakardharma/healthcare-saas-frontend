import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  Card,
  ConfirmModal,
  Input,
  Loader,
  Modal,
  PageHeader,
} from "../../components/common";

import RoleBasedRoute from "../../routes/RoleBasedRoute";
import useUsers from "../../modules/users/hooks/useUsers";

import "./UserManagement.css";

const ROLE_OPTIONS = [
  "Admin",
  "Provider",
  "Nurse",
  "Patient",
  "Pharmacist",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "Patient",
};

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.roles?.[0] || "Patient",
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

      // Role is changed only from this edit form: the selected role
      // replaces the user's previous role(s).
      const currentRoles = editing.roles || [];

      if (form.role && !currentRoles.includes(form.role)) {
        assignRole(editing.id, form.role);
      }

      currentRoles
        .filter((role) => role !== form.role)
        .forEach((role) => removeRole(editing.id, role));
    } else {
      createUser(form);
    }

    setModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="um-page">
        <PageHeader
          title="User & Role Management"
          description="Admin-only management of tenant users and roles."
          action={
            <button
              type="button"
              className="um-btn um-btn-primary"
              onClick={openCreate}
            >
              <Plus size={16} />
              Add User
            </button>
          }
        />

        {error && <div className="um-error">{error}</div>}

        <Card>
          {loading ? (
            <Loader />
          ) : (
            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th className="um-col-actions">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td data-label="ID">{user.id}</td>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="Email" className="um-email">
                          {user.email}
                        </td>

                        <td data-label="Roles">
                          <div className="um-roles">
                            {(user.roles || []).map((role) => (
                              <span className="um-role-tag" key={role}>
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td data-label="Actions">
                          <div className="um-actions">
                            <button
                              type="button"
                              className="um-icon-btn"
                              title="Edit user"
                              aria-label="Edit user"
                              onClick={() => openEdit(user)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              className="um-icon-btn um-icon-btn-danger"
                              title="Delete user"
                              aria-label="Delete user"
                              onClick={() => setDeleteId(user.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="um-empty">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <button
          type="button"
          className="um-btn um-btn-secondary um-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        title={editing ? "Edit User" : "Create User"}
        onClose={() => setModalOpen(false)}
      >
        <form className="um-form" onSubmit={submit}>
          <div className="um-form-grid">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
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
                setForm({ ...form, email: e.target.value })
              }
              required
              disabled={actionLoading}
            />

            <Input
              label={editing ? "New Password (optional)" : "Password"}
              name="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required={!editing}
              disabled={actionLoading}
            />

            <label className="um-field">
              <span>Role</span>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                disabled={actionLoading}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="um-form-actions">
            <button
              type="button"
              className="um-btn um-btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="um-btn um-btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete User"
        message="Delete this user from the tenant?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          deleteUser(deleteId);
          setDeleteId(null);
        }}
      />
    </DashboardLayout>
  );
}

export default function UserManagement() {
  return (
    <RoleBasedRoute allowedRoles={["Admin"]}>
      <UserManagementContent />
    </RoleBasedRoute>
  );
}