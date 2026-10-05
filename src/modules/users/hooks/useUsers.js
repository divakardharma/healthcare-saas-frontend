import { useCallback } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchUsersRequest,
  fetchUserRequest,
  createUserRequest,
  updateUserRequest,
  assignRoleRequest,
  removeRoleRequest,
  deleteUserRequest,
  clearUserError,
} from "../userSlice";

export default function useUsers() {
  const dispatch = useDispatch();

  const state = useSelector(
    (store) => store.users
  );

  const fetchUsers = useCallback(
    (role) =>
      dispatch(
        fetchUsersRequest(
          role ? { role } : undefined
        )
      ),
    [dispatch]
  );

  const fetchUser = useCallback(
    (id) => dispatch(fetchUserRequest(id)),
    [dispatch]
  );

  const createUser = useCallback(
    (data) => dispatch(createUserRequest(data)),
    [dispatch]
  );

  const updateUser = useCallback(
    (id, data) =>
      dispatch(
        updateUserRequest({ id, data })
      ),
    [dispatch]
  );

  const assignRole = useCallback(
    (id, role) =>
      dispatch(
        assignRoleRequest({ id, role })
      ),
    [dispatch]
  );

  const removeRole = useCallback(
    (id, role) =>
      dispatch(
        removeRoleRequest({ id, role })
      ),
    [dispatch]
  );

  const deleteUser = useCallback(
    (id) => dispatch(deleteUserRequest(id)),
    [dispatch]
  );

  const clearError = useCallback(
    () => dispatch(clearUserError()),
    [dispatch]
  );

  return {
    ...state,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    assignRole,
    removeRole,
    deleteUser,
    clearError,
  };
}