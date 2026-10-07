import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: [],
  loading: false,
  error: null
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    fetchNotes: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotesSuccess: (state, action) => {
      state.loading = false;
      state.notes = action.payload;
    },
    fetchNotesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addNote: (state) => {
      state.loading = true;
      state.error = null;
    },
    addNoteSuccess: (state) => {
      state.loading = false;
    },
    addNoteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    editNote: (state) => {
      state.loading = true;
      state.error = null;
    },
    editNoteSuccess: (state) => {
      state.loading = false;
    },
    editNoteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    removeNote: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeNoteSuccess: (state) => {
      state.loading = false;
    },
    removeNoteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearNotes: (state) => {
      state.notes = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
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
  removeNoteFailure,
  clearNotes
} = notesSlice.actions;

export default notesSlice.reducer;