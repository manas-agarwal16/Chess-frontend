import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice.js";
import gameReducer from "./features/gameSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
  },
});

export default store;
