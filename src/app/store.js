import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import sagaMiddleware from "./sagaMiddleware";
import rootSaga from "./rootSaga";

const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;