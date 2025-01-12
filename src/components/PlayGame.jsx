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
  const [checkmate, setCheckmate] = useState(false);
  const [draw, setDraw] = useState(false);

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

    setRoomName(() => players.roomName);
    setIsInGame(() => true);
    setColor(() =>
      players.player1.id === playerData.id
        ? players.player1.color
        : players.player2.color
    );
    setYou(() =>
      players.player1.id === playerData.id ? players.player1 : players.player2
    );
    setOpponent(() =>
      players.player1.id === playerData.id ? players.player2 : players.player1
    );
    setIsGameLoading(() => false);
  });

  useEffect(() => {
    if (
      roomName !== null &&
      you.id !== undefined &&
      opponent.id !== undefined
    ) {
      console.log(
        "playersInfo: ",
        roomName,
        you.id,
        opponent.id,
        color,
        color === "white" ? "black" : "white",
        you.rating,
        opponent.rating
      );

      //to prevent both players calling simultaneously , else unique roomName constraint will fail (simutaneously hone se condition true ha rhi thi kiuki us wakt roomName tha hi nai), so added random seconds to make calls at different times.
      const seconds = Math.floor((Math.random() + Math.random()) * 5000); //two Math.random() to increase randomness

      console.log("seconds : ", seconds);

      setTimeout(() => {
        socket.emit("playersInfo", {
          roomName: roomName,
          player1Id: you.id,
          player2Id: opponent.id,
          player1Color: color,
          player2Color: color === "white" ? "black" : "white",
          player1RatingBefore: you.rating,
          player2RatingBefore: opponent.rating,
        });
      }, seconds);
    }
  }, [roomName]);

  const onDrop = (sourceSquare, targetSquare, piece) => {
    console.log("sourceSquare : ", sourceSquare);
    console.log("targetSquare : ", targetSquare);
    console.log("piece : ", piece);

    let pieceColor = piece[0] == "w" ? "white" : "black";

    if (pieceColor !== color) {
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

      socket.emit("newChessPosition", {
        position: gameCopy.fen(),
        roomName,
        player1Id: you.id,
        player2Id: opponent.id,
        player1Color: color,
        player2Color: color == "white" ? "black" : "white",
      });
      return true;
    } catch (error) {
      console.log("invalid move : ", error);
      return false;
    }
  };

  socket.on("makeMove", (newPosition) => {
    console.log("new position : ", newPosition);
    setPosition(() => newPosition);
    setGame(() => new Chess(newPosition));
  });

  useEffect(() => {
    console.log("checkmate : ", game.isCheckmate());

    if (game.isCheckmate()) {
      let winnerId, losserId;
      if (game._turn === color[0]) {
        winnerId = opponent.id;
        losserId = you.id;
      } else {
        winnerId = you.id;
        losserId = opponent.id;
      }
      console.log(
        "roomName : ",
        roomName,
        "winnerId : ",
        winnerId,
        "losserId : ",
        losserId
      );
      socket.emit("checkmate", { roomName, winnerId, losserId });
    }
    if (
      game.isStalemate() ||
      game.isThreefoldRepetition() ||
      game.isInsufficientMaterial()
    ) {
      socket.emit("draw", { roomName });
    }
  }, [game]);

  // on checkmate
  socket.on(
    "itsCheckmate",
    ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
    }) => {
      console.log("player1RatingBefore : ", player1RatingBefore);
      console.log("player1RatingAfter : ", player1RatingAfter);
      console.log("player2RatingBefore : ", player2RatingBefore);
      console.log("player2RatingAfter : ", player2RatingAfter);

      setCheckmate(() => true);

      console.log('disconnected');
      socket.emit('userDisconnected', playerData.id);
      socket.disconnect();
    }
  );

  socket.on(
    "itsDraw",
    ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
    }) => {
      console.log("player1RatingBefore : ", player1RatingBefore);
      console.log("player1RatingAfter : ", player1RatingAfter);
      console.log("player2RatingBefore : ", player2RatingBefore);
      console.log("player2RatingAfter : ", player2RatingAfter);
      setDraw(() => true);

      socket.emit('userDisconnected', playerData.id);
      socket.disconnect();
    }
  );

  return (
    <>
      {checkmate && game._turn === color[0] && (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Over</h2>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 flex items-center justify-center bg-red-500 text-white rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-700">You lost the game!</p>
            <div className="mt-6">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      {checkmate && game._turn !== color[0] && (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Over</h2>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 flex items-center justify-center bg-green-500 text-white rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-700">You won the game!</p>
            <div className="mt-6">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
      {draw && (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Over</h2>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 flex items-center justify-center bg-yellow-500 text-white rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v6m3-3H9"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-700">The game is a draw!</p>
            <div className="mt-6">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {!checkmate && !draw && (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
          {loading && <CenterSpinner />}
          {isGameLoading && <p>Waiting for a player to join</p>}
          {!loading && !isGameLoading && (
            <div className="w-full max-w-[550px] p-4 mx-auto flex flex-col">
              <p className="text-center ilatic text-lg text-white font-semibold">
                {opponent.handle.toUpperCase()}
              </p>
              <Chessboard
                id="PlayVsRandom"
                position={position}
                onPieceDrop={onDrop}
                boardOrientation={color}
                // customBoardStyle={{
                //   borderRadius: "4px",
                //   boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                //   width: "100%", // Ensure it takes full width of the parent container
                //   height: "100%",
                //   position: "relative",
                // }}
                customBoardStyle={{
                  borderRadius: "4px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                  width: "100%",
                  height: "100%",
                  minWidth: "300px", // Minimum size for usability
                  minHeight: "300px",
                  maxWidth: "550px",
                  maxHeight: "550px",
                  position: "relative",
                }}
                //prevent page scrolling when dragging pieces
                onPieceDragBegin={(piece, sourceSquare) => {
                  document.body.style.overflow = "hidden";
                }}
                onPieceDragEnd={(piece, sourceSquare, targetSquare) => {
                  document.body.style.overflow = ""; // Restore scrolling
                }}
              />
              {/* <p className="text-center ilatic text-lg text-white font-semibold">
                {you.handle.toUpperCase()}
              </p> */}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PlayGame;
