import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { CenterSpinner } from "./index.js";
import {
  setGameLoading,
  setInGame,
  setGameColor,
  setOpponent,
  setPlayer,
} from "../store/features/gameSlice.js";

const PlayGame = () => {
  const socket = useMemo(() => io(import.meta.env.VITE_BACKEND_URL), []);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loginStatus, playerData, loading } = useSelector(
    (state) => state.auth
  );
  const { gameLoading, color, player, opponent, inGame } = useSelector(
    (state) => state.game
  );

  const [isProcessOngoing, setIsProcessOngoing] = useState(true);

  // Add an event listener for the beforeunload event
  window.addEventListener("beforeunload", (event) => {
    if (isProcessOngoing) {
      // Show a confirmation dialog
      event.preventDefault();
      event.returnValue = ""; // Required for most modern browsers
    }
  });

  function showCustomWarning() {
    if (isProcessOngoing) {
      const userConfirmed = confirm(
        "A process is ongoing. Are you sure you want to leave this page?"
      );
      if (userConfirmed) {
        setIsProcessOngoing(false); // Allow navigation
        window.location.href = "http://localhost:5173"; // Navigate away
      }
    }
  }

  // console.log("loginStatus : ", loginStatus);
  // console.log("playerData : ", playerData);

  useEffect(() => {
    if (loginStatus === false && !loading) {
      navigate("/login");
    }
    if (loginStatus === true && loading === false) {
      socket.on("connect", () => {
        console.log("socket connected");
      });

      socket.emit("playWithStranger", playerData.id);

      socket.on("error", (error) => {
        console.log("error : ", error);
      });

      //clear
      socket.on("WaitingForAPlayer", () => {
        console.log("Waiting for a player to join");
      });

      //clear
      socket.on("startTheGame", (players) => {
        console.log("player1 : ", players.player1);
        console.log("player2 : ", players.player2);

        dispatch(setGameLoading(false));
        dispatch(setInGame(true));
        dispatch(setGameColor(true));
        dispatch(
          setPlayer(
            playerData.id === players.player1.id
              ? players.player1
              : players.player2
          )
        );

        dispatch(
          setOpponent(
            playerData.id === players.player1.id
              ? players.player2
              : players.player1
          )
        );

        if (loading === false) {
          console.log("gameLoading : ", gameLoading);
          console.log("color : ", color);
          console.log("player : ", player);
          console.log("opponent : ", opponent);
          console.log("inGame : ", inGame);
        }

        //if getCurrentPlayer is player1 then playerColor = player1.color in socketSlice else playerColor = player2.color.

        // navigate("/play");
      });
    }
  }, [loginStatus, loading, navigate]);

  return (
    <>
      {loading && <CenterSpinner />}
      <h1>Play Game</h1>
    </>
  );
};

export default PlayGame;
