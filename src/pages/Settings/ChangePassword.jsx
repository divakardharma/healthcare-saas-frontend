import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Eye, EyeOff, KeyRound, Lock, TriangleAlert } from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import "./ChangePassword.css";

const EMPTY_FORM = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const FIELDS = [
  {
    name: "current_password",
    label: "Current Password",
    placeholder: "Enter current password",
    autoComplete: "current-password",
  },
  {
    name: "new_password",
    label: "New Password",
    placeholder: "Enter new password",
    autoComplete: "new-password",
  },
  {
    name: "confirm_password",
    label: "Confirm New Password",
    placeholder: "Confirm new password",
    autoComplete: "new-password",
  },
];

const ChangePassword = () => {
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState(EMPTY_FORM);
  const [visible, setVisible] = useState({});
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState("");

  // true between submit and the request finishing
  const submitted = useRef(false);

  // The store only exposes loading/error, so a finished request with
  // no error means the password was changed.
  useEffect(() => {
    if (!loading && submitted.current) {
      submitted.current = false;

      if (!error) {
        setSuccess("Your password has been changed successfully.");
        setForm(EMPTY_FORM);
        setVisible({});
      }
    }
  }, [loading, error]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    setValidationError("");
    setSuccess("");
  };

  const toggleVisible = (name) => {
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }));
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
      setValidationError("Please fill in all password fields.");
      return;
    }

    if (form.new_password.length < 8) {
      setValidationError("New password must be at least 8 characters.");
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

    submitted.current = true;

    dispatch({
      type: "auth/changePasswordRequest",
      payload: {
        current_password: form.current_password,
        new_password: form.new_password,
      },
    });
  };

  const message = validationError || error;

  return (
    <DashboardLayout>
      <div className="cp-page">
        <div className="cp-header">
          <span className="cp-header-icon">
            <KeyRound size={22} />
          </span>

          <div>
            <h2>Change Password</h2>
            <p>
              Update your account password to keep your account secure.
            </p>
          </div>
        </div>

        <div className="cp-card">
          {message && (
            <div className="cp-message cp-message-error" role="alert">
              <TriangleAlert size={16} />
              <span>{message}</span>
            </div>
          )}

          {success && (
            <div className="cp-message cp-message-success" role="status">
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}

          <form className="cp-form" onSubmit={handleSubmit}>
            {FIELDS.map((field) => (
              <div className="cp-group" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>

                <div className="cp-input-wrap">
                  <Lock size={16} className="cp-input-icon" />

                  <input
                    id={field.name}
                    name={field.name}
                    type={visible[field.name] ? "text" : "password"}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="cp-eye"
                    onClick={() => toggleVisible(field.name)}
                    aria-label={
                      visible[field.name] ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {visible[field.name] ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            <button type="submit" className="cp-submit" disabled={loading}>
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChangePassword;