import { call, put, takeLatest } from "redux-saga/effects";
import {
  getNotesByAppointment,
  createNote,
  updateNote,
  deleteNote
} from "./notesAPI";
import {
  fetchNotes,
  fetchNotesSuccess,
  fetchNotesFailure,
  addNote,
  addNoteSuccess,
  addNoteFailure,
  editNote,
  editNoteSuccess,
  editNoteFailure,
  removeNote,
  removeNoteSuccess,
  removeNoteFailure
} from "./notesSlice";

const getErrorMessage = (error, fallbackMessage) => {
  try {
    if (error.response?.data?.payload) {
      const encryptedError = error.response.data.payload;
      const { decryptData } = require("../../services/encryptionService");
      const decryptedError = decryptData(encryptedError);

      return decryptedError?.message || fallbackMessage;
    }
  } catch (decryptError) {
    return fallbackMessage;
  }

  return error.response?.data?.message || fallbackMessage;
};

function* fetchNotesSaga(action) {
  try {
    const response = yield call(
      getNotesByAppointment,
      action.payload
    );

    yield put(fetchNotesSuccess(response));
  } catch (error) {
    yield put(
      fetchNotesFailure(
        getErrorMessage(error, "Failed to load notes")
      )
    );
  }
}

function* addNoteSaga(action) {
  try {
    yield call(createNote, action.payload);

    yield put(addNoteSuccess());

    yield put(
      fetchNotes(action.payload.appointment_id)
    );
  } catch (error) {
    yield put(
      addNoteFailure(
        getErrorMessage(error, "Failed to add note")
      )
    );
  }
}

function* editNoteSaga(action) {
  try {
    const { noteId, data, appointmentId } = action.payload;

    yield call(updateNote, noteId, data);

    yield put(editNoteSuccess());

    yield put(fetchNotes(appointmentId));
  } catch (error) {
    yield put(
      editNoteFailure(
        getErrorMessage(error, "Failed to update note")
      )
    );
  }
}

function* removeNoteSaga(action) {
  try {
    const { noteId, appointmentId } = action.payload;

    yield call(deleteNote, noteId);

    yield put(removeNoteSuccess());

    yield put(fetchNotes(appointmentId));
  } catch (error) {
    yield put(
      removeNoteFailure(
        getErrorMessage(error, "Failed to delete note")
      )
    );
  }
}

export default function* notesSaga() {
  yield takeLatest(
    fetchNotes.type,
    fetchNotesSaga
  );

  yield takeLatest(
    addNote.type,
    addNoteSaga
  );

  yield takeLatest(
    editNote.type,
    editNoteSaga
  );

  yield takeLatest(
    removeNote.type,
    removeNoteSaga
  );
}