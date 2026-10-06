const getTenantFromDomain = () => {
  const hostname = window.location.hostname.toLowerCase();

  // Local development
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return null;
  }

  // tenant.localhost
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(".localhost", "");

    return subdomain && subdomain !== "www"
      ? subdomain
      : null;
  }

  // Production: tenant.heal.com
  const parts = hostname.split(".");

  if (parts.length === 3 && parts[0] !== "www") {
    return parts[0];
  }

  return null;
};

export default getTenantFromDomain;