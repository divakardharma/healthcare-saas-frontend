import { useSelector } from "react-redux";

function useTenant() {
  const tenant = useSelector((state) => state.tenant);

  return tenant;
}

export default useTenant;