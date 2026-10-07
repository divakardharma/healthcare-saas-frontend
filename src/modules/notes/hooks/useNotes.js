import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotes,
  addNote,
  editNote,
  removeNote,
  clearNotes
} from "../notesSlice";

const useNotes = () => {
  const dispatch = useDispatch();

  const {
    notes,
    loading,
    error
  } = useSelector((state) => state.notes);

  const loadNotes = (appointmentId) => {
    dispatch(fetchNotes(appointmentId));
  };

  const createNewNote = (data) => {
    dispatch(addNote(data));
  };

  const updateExistingNote = (noteId, data, appointmentId) => {
    dispatch(
      editNote({
        noteId,
        data,
        appointmentId
      })
    );
  };

  const deleteExistingNote = (noteId, appointmentId) => {
    dispatch(
      removeNote({
        noteId,
        appointmentId
      })
    );
  };

  const resetNotes = () => {
    dispatch(clearNotes());
  };

  return {
    notes,
    loading,
    error,
    loadNotes,
    createNewNote,
    updateExistingNote,
    deleteExistingNote,
    resetNotes
  };
};

export default useNotes;