import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerTenantRequest } from "../../modules/tenant/tenantSlice";
import { Input, Button, Loader } from "../../components/common";

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
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <h1>Hospital Registration</h1>

      <form onSubmit={handleSubmit}>
        <Input
          label="Hospital Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter hospital name"
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
        />

        <Input
          label="Subdomain"
          name="subdomain"
          value={formData.subdomain}
          onChange={handleChange}
          placeholder="Example: gov"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
        />

        <div style={{ marginTop: "20px" }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </div>
      </form>

      {loading && <Loader />}

      {error && (
        <p style={{ marginTop: "15px" }}>
          {error}
        </p>
      )}

      {registrationSuccess && (
        <p style={{ marginTop: "15px" }}>
          Hospital registered successfully.
        </p>
      )}
    </div>
  );
}

export default RegisterPage;