import useAuth from "../../auth/hooks/useAuth";

function useSecurity() {
  const {
    user,
    isAuthenticated,
    initialized,
    logoutUser,
  } = useAuth();

  const roles = user?.roles || [];

  const hasRole = (role) => {
    return roles.includes(role);
  };

  const hasAnyRole = (allowedRoles = []) => {
    return allowedRoles.some((role) => roles.includes(role));
  };

  return {
    user,
    roles,
    isAuthenticated,
    initialized,
    hasRole,
    hasAnyRole,
    logoutUser,
  };
}

export default useSecurity;