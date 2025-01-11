import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { CenterSpinner } from "./index.js";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { set } from "react-hook-form";

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

  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());

  const { loginStatus, playerData, loading } = useSelector(
    (state) => state.auth
  );

  const [isGameLoading, setIsGameLoading] = useState(true);
  const [isInGame, setIsInGame] = useState(false);
  const [color, setColor] = useState(null);
  const [you, setYou] = useState({});
  const [opponent, setOpponent] = useState({});
  const [roomName, setRoomName] = useState(null);

  const [isProcessOngoing, setIsProcessOngoing] = useState(true);

  // Add an event listener for the beforeunload event
  // window.addEventListener("beforeunload", (event) => {
  //   if (isProcessOngoing) {
  //     // Show a confirmation dialog
  //     event.preventDefault();
  //     event.returnValue = ""; // Required for most modern browsers
  //   }
  // });

  console.log("loginStatus : ", loginStatus);
  console.log("playerData : ", playerData);

  // const requestFullscreen = () => {
  //   const doc = document.documentElement;

  //   if (doc.requestFullscreen) {
  //     doc.requestFullscreen();
  //   } else if (doc.mozRequestFullScreen) {
  //     // Firefox
  //     doc.mozRequestFullScreen();
  //   } else if (doc.webkitRequestFullscreen) {
  //     // Chrome, Safari, and Opera
  //     doc.webkitRequestFullscreen();
  //   } else if (doc.msRequestFullscreen) {
  //     // IE/Edge
  //     doc.msRequestFullscreen();
  //   }
  // };

  useEffect(() => {
    if (loginStatus === false && !loading) {
      navigate("/login");
    }
    if (loginStatus === true && loading === false) {
      // requestFullscreen();

      socket.connect();

      return () => {
        console.log("cleanup");
        socket.emit("userDisconnected", playerData.id);
        socket.disconnect();
      };
    }
  }, [loginStatus, loading, navigate]);

  //fixed, ander hi rahega playWithStranger
  socket.on("connect", () => {
    console.log("socket connected");
    socket.emit("playWithStranger", playerData.id);
  });

  socket.on("disconnect", () => {
    socket.emit("userDisconnected", playerData.id);
  });

  socket.on("error", (error) => {
    console.log("error : ", error);
  });

  //clear
  socket.on("WaitingForAPlayer", (roomName) => {
    console.log("Waiting for a player to join: ", roomName);
  });

  //clear
  socket.on("startTheGame", async (players) => {
    console.log("roomName : ", players.roomName);
    console.log("player1 : ", players.player1);
    console.log("player2 : ", players.player2);

    setRoomName(players.roomName);
    setIsInGame(true);
    setColor(
      players.player1.id === playerData.id
        ? players.player1.color
        : players.player2.color
    );
    setYou(
      players.player1.id === playerData.id ? players.player1 : players.player2
    );
    setOpponent(
      players.player1.id === playerData.id ? players.player2 : players.player1
    );
    setIsGameLoading(false);

    //if getCurrentPlayer is player1 then playerColor = player1.color in socketSlice else playerColor = player2.color.

    // navigate("/play");
  });

  // const onDrop = (sourceSquare, targetSquare, piece) => {
  //   console.log("sourceSquare : ", sourceSquare);
  //   console.log("targetSquare : ", targetSquare);
  //   console.log("piece : ", piece);

  //   const gameCopy = new Chess(game.fen());

  //   const move = gameCopy.move({
  //     from: sourceSquare,
  //     to: targetSquare,
  //     promotion: game._turn == "w" ? "Q" : "q", // always promote to a queen for example simplicity
  //   });

  //   if (move === null) {
  //     console.log("invalid move");
  //     return;
  //   }
  //   socket.emit("newChessPosition", { position: gameCopy.fen(), roomName });
  //   socket.on("makeMove", (newPosition) => {
  //     console.log("new position : ", newPosition);
  //     setPosition(newPosition);
  //     setGame(new Chess(newPosition));
  //   });
  // };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    console.log("sourceSquare : ", sourceSquare);
    console.log("targetSquare : ", targetSquare);
    console.log("piece : ", piece);

    let pieceColor = piece[0] == 'w'  ? 'white' : 'black';

    if(pieceColor !== color){
      return false;
    }

    const gameCopy = new Chess(game.fen());
    console.log("game : ", gameCopy.fen());

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q", // always promote to a queen for example simplicity
      });

      console.log("move : ", move);

      if (move === null) {
        console.log("invalid move");
        // setGame(game);
        return false;
      }

      socket.emit("newChessPosition", { position: gameCopy.fen(), roomName });
      return true;
    } catch (error) {
      console.log("invalid move : ", error);
      return false;
    }
  };
  socket.on("makeMove", (newPosition) => {
    console.log("new position : ", newPosition);
    setPosition(newPosition);
    setGame(new Chess(newPosition));
  });

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      {loading && <CenterSpinner />}
      {isGameLoading && <p>Waiting for a player to join</p>}
      {!loading && !isGameLoading && (
        <div className="w-full max-w-[550px] p-4 mx-auto">
          <Chessboard
            id="PlayVsRandom"
            position={position}
            onPieceDrop={onDrop}
            boardOrientation={color}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              width: "100%", // Ensure it takes full width of the parent container
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PlayGame;
