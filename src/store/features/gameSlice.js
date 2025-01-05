import { createSlice } from "@reduxjs/toolkit";
import { set } from "react-hook-form";

const initialState = {
  gameLoading: null,
  color: null,
  opponent: {},
  player: {},
  inGame: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameLoading: (state, action) => {
      console.log("action.payload", action.payload);
      state.gameLoading = action.payload;
    },
    setGameColor: (state, action) => {
      state.color = action.payload;
    },
    setOpponent: (state, action) => {
      state.opponent = action.payload;
    },
    setPlayer: (state, action) => {
      state.player = action.payload;
    },
    setInGame: (state, action) => {
      state.inGame = action.payload;
    },
  },
});

export default gameSlice.reducer;
export const {
  setGameLoading,
  setGameColor,
  setOpponent,
  setPlayer,
  setInGame,
} = gameSlice.actions;
