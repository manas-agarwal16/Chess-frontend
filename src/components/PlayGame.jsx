import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { CenterSpinner } from "./index.js";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const PlayGame = () => {
  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_BACKEND_URL, {
        autoConnect: false,
        reconnection: false,
      }),
    []
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chess = new Chess();

  const [game, setGame] = useState(chess.fen());

  const { loginStatus, playerData, loading } = useSelector(
    (state) => state.auth
  );

  const [isGameLoading, setIsGameLoading] = useState(true);
  const [isInGame, setIsInGame] = useState(false);
  const [color, setColor] = useState(null);
  const [you, setYou] = useState({});
  const [opponent, setOpponent] = useState({});

  const [isProcessOngoing, setIsProcessOngoing] = useState(true);

  // Add an event listener for the beforeunload event
  window.addEventListener("beforeunload", (event) => {
    if (isProcessOngoing) {
      // Show a confirmation dialog
      event.preventDefault();
      event.returnValue = ""; // Required for most modern browsers
    }
  });

  console.log("loginStatus : ", loginStatus);
  console.log("playerData : ", playerData);

  const requestFullscreen = () => {
    const doc = document.documentElement;

    if (doc.requestFullscreen) {
      doc.requestFullscreen();
    } else if (doc.mozRequestFullScreen) {
      // Firefox
      doc.mozRequestFullScreen();
    } else if (doc.webkitRequestFullscreen) {
      // Chrome, Safari, and Opera
      doc.webkitRequestFullscreen();
    } else if (doc.msRequestFullscreen) {
      // IE/Edge
      doc.msRequestFullscreen();
    }
  };

  useEffect(() => {
    if (loginStatus === false && !loading) {
      navigate("/login");
    }
    if (loginStatus === true && loading === false) {
      requestFullscreen();
      // alert('Reloading page might exit you from the game.')
      socket.connect();

      socket.on("connect", () => {
        console.log("socket connected");
      });

      socket.on("disconnect", () => {
        socket.emit("userDisconnected", playerData.id);
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
      socket.on("startTheGame", async (players) => {
        console.log("player1 : ", players.player1);
        console.log("player2 : ", players.player2);

        setIsInGame(true);
        setColor(
          players.player1.id === playerData.id
            ? players.player1.color
            : players.player2.color
        );
        setYou(
          players.player1.id === playerData.id
            ? players.player1
            : players.player2
        );
        setOpponent(
          players.player1.id === playerData.id
            ? players.player2
            : players.player1
        );
        setIsGameLoading(false);

        //if getCurrentPlayer is player1 then playerColor = player1.color in socketSlice else playerColor = player2.color.

        // navigate("/play");
      });

      return () => {
        console.log("cleanup");
        socket.disconnect();
        socket.emit("userDisconnected", playerData.id);
      };
    }
  }, [loginStatus, loading, navigate]);

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center">
      {loading && <CenterSpinner />}
      {isGameLoading && <p>Waiting for a player to join</p>}
      {!loading && !isGameLoading && (
        <div className="w-[500px] h-[500px] mx-auto border-2 border-red-500">
          <Chessboard
            position={game}
            boardOrientation={color}
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

export default PlayGame;
