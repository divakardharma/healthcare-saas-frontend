import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { registerTenantRequest } from "../../modules/tenant/tenantSlice";
import { Input, Button, Card } from "../../components/common";
import styles from "./RegisterPage.module.css";

function RegisterPage() {
  const dispatch = useDispatch();

  const { loading, error, registrationSuccess } = useSelector(
    (state) => state.tenant
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subdomain: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    dispatch(registerTenantRequest(formData));
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Hospital Registration</h1>
          <p className={styles.subtitle}>
            Create an account to get your hospital set up.
          </p>
        </div>

        <Card>
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Hospital Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter hospital name"
              disabled={loading}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="username"
              disabled={loading}
            />

            <Input
              label="Subdomain"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              placeholder="Example: apollo"
              disabled={loading}
            />
            <span className={styles.hint}>
              This will be your hospital's unique address.
            </span>

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="new-password"
              disabled={loading}
            />

            {error && (
              <div className={`${styles.alert} ${styles.error}`} role="alert">
                {error}
              </div>
            )}

            {registrationSuccess && (
              <div
                className={`${styles.alert} ${styles.success}`}
                role="status"
              >
                Hospital registered successfully.
              </div>
            )}

            <div className={styles.submit}>
              <Button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>
        </Card>

        <p className={styles.footer}>
          Already registered?{" "}
          <Link to="/login" className={styles.footerLink}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;