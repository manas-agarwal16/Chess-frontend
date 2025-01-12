import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { CenterSpinner } from "./index.js";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { updatePlayerRating } from "../store/features/gameSlice.js";

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
  const [color, setColor] = useState(null);
  const [you, setYou] = useState({});
  const [opponent, setOpponent] = useState({});
  const [youNewRatinng, setYouNewRatinng] = useState(null);
  const [opponentNewRating, setOpponentNewRating] = useState(null);
  const [status, setStatus] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [checkmate, setCheckmate] = useState(false);
  const [draw, setDraw] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);

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

  //waiting for a player
  socket.on("WaitingForAPlayer", (roomName) => {
    console.log("Waiting for a player to join: ", roomName);
  });

  //start the game
  socket.on("startTheGame", async (players) => {
    console.log("roomName : ", players.roomName);
    console.log("player1 : ", players.player1);
    console.log("player2 : ", players.player2);

    setRoomName(() => players.roomName);
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

  //playersInfo to backend when game starts;
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

  //backend makeMove
  socket.on("makeMove", (newPosition) => {
    console.log("new position : ", newPosition);
    setPosition(() => newPosition);
    setGame(() => new Chess(newPosition));
  });

  //game over- checkmate or draw to backend./
  useEffect(() => {
    console.log("checkmate : ", game.isCheckmate());

    if (game.isCheckmate()) {
      setGameLoading(() => true);
      let winnerId, losserId;
      if (game._turn === color[0]) {
        winnerId = opponent.id;
        losserId = you.id;
        setStatus(() => "Loss");
      } else {
        winnerId = you.id;
        losserId = opponent.id;
        setStatus(() => "Won");
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
      setGameLoading(() => true);
      setStatus(() => "Draw");
      socket.emit("draw", { roomName });
    }
  }, [game]);

  // backend itsCheckmate
  socket.on(
    "itsCheckmate",
    ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
      player1Id,
      player2Id,
    }) => {
      console.log("player1RatingBefore : ", player1RatingBefore);
      console.log("player1RatingAfter : ", player1RatingAfter);
      console.log("player2RatingBefore : ", player2RatingBefore);
      console.log("player2RatingAfter : ", player2RatingAfter);

      setYouNewRatinng(() =>
        you.id === player1Id ? player1RatingAfter : player2RatingAfter
      );
      setOpponentNewRating(() =>
        opponent.id === player1Id ? player1RatingAfter : player2RatingAfter
      );
      setCheckmate(() => true);

      dispatch(
        updatePlayerRating(
          you.id === player1Id ? player1RatingAfter : player2RatingAfter
        )
      );

      console.log("disconnected");
      socket.emit("userDisconnected", playerData.id);
      setGameLoading(() => false);
      socket.disconnect();
    }
  );

  //backend itsDraw
  socket.on(
    "itsDraw",
    ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
      player1Id,
      player2Id,
    }) => {
      console.log("player1RatingBefore : ", player1RatingBefore);
      console.log("player1RatingAfter : ", player1RatingAfter);
      console.log("player2RatingBefore : ", player2RatingBefore);
      console.log("player2RatingAfter : ", player2RatingAfter);

      setYouNewRatinng(() =>
        you.id === player1Id ? player1RatingAfter : player2RatingAfter
      );
      setOpponentNewRating(() =>
        opponent.id === player1Id ? player1RatingAfter : player2RatingAfter
      );

      dispatch(
        updatePlayerRating(
          you.id === player1Id ? player1RatingAfter : player2RatingAfter
        )
      );

      setDraw(() => true);

      socket.emit("userDisconnected", playerData.id);
      setGameLoading(() => false);
      socket.disconnect();
    }
  );

  return (
    <>
      {gameLoading && <CenterSpinner />}
      {(checkmate || draw) && (
        <>
          <div className="h-screen bg- w-full border-4 border-gray-700 flex items-center justify-center">
            {/* Player Info Section */}
            <div className="flex flex-col items-center justify-center space-y-6 p-6 bg-gray-300 shadow-lg rounded-lg w-1/3">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xl font-bold text-gray-800">
                  {you.handle}
                </span>
                <span className="text-lg text-gray-600">
                  Rating Before: {you.rating}
                </span>
                <span className="text-lg text-gray-600">
                  Rating Now: {youNewRatinng}
                </span>
                <span className="text-2xl text-gray-800 font-semibold">
                  {status}
                </span>
              </div>
              <div className="w-full bg-gray-300 h-1 rounded-md"></div>
              <div
                onClick={() => navigate("/")}
                className="flex items-center justify-center bg-blue-500 text-white rounded-md py-2 px-4 w-full text-center cursor-pointer hover:bg-blue-600"
              >
                <span>Return Home</span>
              </div>
            </div>

            {/* Divider (Chessboard Look) */}
            <div className="mx-8 bg-gray-400 h-80 w-0.5"></div>

            {/* Opponent Info Section */}
            <div className="flex flex-col items-center justify-center space-y-6 p-6 bg-white shadow-lg rounded-lg w-1/3">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xl font-bold text-gray-800">
                  {opponent.handle}
                </span>
                <span className="text-lg text-gray-600">
                  Rating Before: {opponent.rating}
                </span>
                <span className="text-lg text-gray-600">
                  Rating Now: {opponentNewRating}
                </span>
                <span className="text-2xl text-gray-800 font-semibold">
                  {status === "Draw"
                    ? "Draw"
                    : status === "Won"
                    ? "Loss"
                    : "Won"}
                </span>
              </div>
              <div className="w-full bg-gray-300 h-1 rounded-md"></div>
            </div>
          </div>
        </>
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
