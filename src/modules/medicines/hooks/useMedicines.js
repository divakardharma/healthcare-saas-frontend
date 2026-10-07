import { useDispatch, useSelector } from "react-redux";
import { fetchMedicines } from "../medicineSlice";

const useMedicines = () => {
  const dispatch = useDispatch();

  const {
    medicines,
    loading,
    error
  } = useSelector((state) => state.medicines);

  const loadMedicines = () => {
    dispatch(fetchMedicines());
  };

  return {
    medicines,
    loading,
    error,
    loadMedicines
  };
};

export default useMedicines;