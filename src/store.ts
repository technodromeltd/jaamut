import { configureStore } from "@reduxjs/toolkit";
import groupReducer from "./slices/groupSlice";

export const store = configureStore({
  reducer: {
    group: groupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
