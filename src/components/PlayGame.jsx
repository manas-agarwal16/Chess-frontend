import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useForm } from "react-hook-form";
import { CenterSpinner, Input, Button } from "./index.js";
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
  const { mode } = useParams();
  // console.log("mode: ", mode);

  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());

  const { loginStatus, playerData, loading } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm();

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
  const [askToEnterCode, setAskToEnterCode] = useState(false);
  const [enterCode, setEnterCode] = useState(false);
  const [code, setCode] = useState(null);
  const [resignGameMsg, setResignGameMsg] = useState(false);
  const [opponentResigned, setOpponentResigned] = useState(false);
  const [todoId, setTodoId] = useState(null); //konsa player task krega

  // window.addEventListener("load", () => {
  //   console.log("user reloaded");
  // });

  // full screen
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

  //login check and socket connection
  useEffect(() => {
    console.log("resigned: ", sessionStorage.getItem("resigned"));

    if (sessionStorage.getItem("resigned") == "true") {
      console.log("navigate to the home");
      navigate("/");
      return;
    }
    if (loginStatus === false && !loading) {
      navigate("/login");
    }
    if (loginStatus === true && loading === false) {
      requestFullscreen();
      socket.connect();
      // setTimeout(() => {
      //   requestFullscreen();
      //   socket.connect();
      // }, 200);

      return () => {
        console.log("cleanup");
        socket.emit("userDisconnected", playerData.id);
        socket.disconnect();
      };
    }
  }, [loginStatus, loading, navigate]);

  //play with stranger , createRoom , joinRoom
  socket.on("connect", () => {
    console.log("socket connected");
    if (mode === "online") {
      socket.emit("playWithStranger", playerData.id);
    } else {
      if (mode === "friend-create") {
        setGameLoading(() => true);
        socket.emit("createRoom", playerData.id);
      } else {
        setEnterCode(() => true);
      }
    }
  });

  // Add an event listener for the beforeunload event
  window.addEventListener("beforeunload", (event) => {
    // if (isProcessOngoing) {
    // event.preventDefault();
    // event.returnValue = "";
    if (you.id == todoId) {
      console.log("updating todoId and leaving the game");
      socket.emit("updateTodoId", { id: opponent.id, roomName });
    }
    sessionStorage.setItem("resigned", "true");
    handleResignGame();
    // console.log('re');

    // console.log("user try to reload, resigning the game");
  });

  socket.on("updateTodoIdFromBackend", (id) => {
    setTodoId(() => id);
    console.log("todoId updated: ", id);
  });

  //ask to enter code
  socket.on("askToEnterCode", (uniqueCode) => {
    setAskToEnterCode(true);
    setGameLoading(() => false);
    setCode(uniqueCode);
  });

  //join room
  const handleEnteredCode = ({ code }) => {
    console.log("entered code : ", code);
    setGameLoading(() => true);
    socket.emit("joinRoom", { code, playerId: playerData.id });
  };

  //invalid friend code
  socket.on("invalidCode", () => {
    console.log("invalid code");
    setGameLoading(() => false);
    setError("code", {
      type: "manual",
      message: "Invalid Code",
    });
  });

  socket.on("disconnect", () => {
    socket.emit("userDisconnected", playerData.id);
  });

  //for any error from backend
  socket.on("error", (error) => {
    console.log("error : ", error);
    setGameLoading(() => false);
    setOpponentResigned(() => false);
    setResignGameMsg(() => false);
  });

  //waiting for a player
  socket.on("WaitingForAPlayer", (roomName) => {
    console.log("Waiting for a player to join: ", roomName);
  });

  //start the game
  socket.on("startTheGame", async (players) => {
    console.log("roomName : ", players.roomName);
    // console.log("player1 : ", players.player1);
    // console.log("player2 : ", players.player2);

    console.log("todoId: ", players.todoId);

    setTodoId(players.todoId);
    setAskToEnterCode(() => false);
    setEnterCode(() => false);
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
    setGameLoading(() => false);
  });

  //playersInfo to backend when game starts;
  useEffect(() => {
    if (
      roomName !== null &&
      you.id !== undefined &&
      opponent.id !== undefined
    ) {
      // console.log(
      //   "playersInfo: ",
      //   roomName,
      //   you.id,
      //   opponent.id,
      //   color,
      //   color === "white" ? "black" : "white",
      //   you.rating,
      //   opponent.rating
      // );

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
    // console.log("sourceSquare : ", sourceSquare);
    // console.log("targetSquare : ", targetSquare);
    // console.log("piece : ", piece);

    let pieceColor = piece[0] == "w" ? "white" : "black";

    if (pieceColor !== color) {
      return false;
    }

    const gameCopy = new Chess(game.fen());
    // console.log("game : ", gameCopy.fen());

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q", // always promote to a queen for example simplicity
      });

      // console.log("move : ", move);

      if (move === null) {
        // console.log("invalid move");
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
    // console.log("new position : ", newPosition);
    setPosition(() => newPosition);
    setGame(() => new Chess(newPosition));
  });

  //game over- checkmate or draw to backend./
  useEffect(() => {
    console.log("checkmate : ", game.isCheckmate());
    if (game.isCheckmate()) {
      setTimeout(() => {
        setGameLoading(() => true);
      }, 1000);
      let winnerId, losserId;
      if (game._turn === color[0]) {
        winnerId = opponent.id;
        losserId = you.id;
        setStatus(() => "Lost");
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
      if (you.id === todoId) {
        setTimeout(() => {
          console.log("checkmate from up here");
          socket.emit("checkmate", { roomName, winnerId, losserId });
        }, 500);
      }
    }
    if (
      game.isStalemate() ||
      game.isThreefoldRepetition() ||
      game.isInsufficientMaterial()
    ) {
      setTimeout(() => {
        setGameLoading(() => true);
        setStatus(() => "Draw");
        socket.emit("draw", { roomName });
      }, 500);
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
      // console.log("player1RatingBefore : ", player1RatingBefore);
      // console.log("player1RatingAfter : ", player1RatingAfter);
      // console.log("player2RatingBefore : ", player2RatingBefore);
      // console.log("player2RatingAfter : ", player2RatingAfter);

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

  const handleResignGame = () => {
    setResignGameMsg(() => false);
    socket.emit("resignGame", { roomName, playerId: playerData.id });
  };

  socket.on("resignedGame", ({ roomName, playerId }) => {
    console.log("resignedGame : ", roomName, playerId);

    if (you.id != (undefined || null) && opponent.id != (undefined || null)) {
      console.log("you.id : ", you.id);
      if (you.id === playerId) {
        console.log("you resigned the game");
      } else {
        console.log("here");
        setOpponentResigned(() => true);
      }
      setGameLoading(() => true);
      setTimeout(() => {
        setOpponentResigned(() => false);
        setStatus(() => (you.id === playerId ? "Lost" : "Won"));

        if (you.id === todoId) {
          console.log("checkmate from down here");

          socket.emit("checkmate", {
            roomName,
            winnerId: you.id === playerId ? opponent.id : you.id,
            losserId: playerId,
          });
        }
      }, 500);
    }
  });

  return (
    <>
      {gameLoading && !opponentResigned && <CenterSpinner />}
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
                    ? "Lost"
                    : "Won"}
                </span>
              </div>
              <div className="w-full bg-gray-300 h-1 rounded-md"></div>
            </div>
          </div>
        </>
      )}
      {askToEnterCode && mode === "friend-create" && (
        <>
          {/* Blur Background (whole screen) */}
          <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>

          {/* Square with Buttons (Friend Box) */}
          <div className="fixed inset-0 flex items-center justify-center z-20">
            <div className="relative w-72 h-72 bg-[#DEB887] rounded-lg shadow-lg flex flex-col items-center justify-center gap-4">
              {/* Close Button */}
              {/* Modal Content */}
              <p className="text-gray-900">
                Ask Your Friend To Enter The Code:{" "}
              </p>
              <p className="text-gray-700 bg-white w-32 rounded text-center">
                {code}
              </p>
              <Link to={"/"} className="text-gray-700 text-sm underline">
                Home
              </Link>
            </div>
          </div>
        </>
      )}
      {enterCode && mode === "friend-join" && (
        <>
          {/* Blur Background (whole screen) */}
          <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>

          {/* Square with Buttons (Friend Box) */}
          <div className="fixed inset-0 flex items-center justify-center z-20">
            <div className="relative w-72 h-72 bg-[#DEB887] rounded-lg shadow-lg flex flex-col items-center justify-center">
              {/* Enter code form */}
              <form onSubmit={handleSubmit(handleEnteredCode)}>
                <div className="mb-3">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-white mb-1"
                  >
                    Enter The Code:
                  </label>
                  <Input
                    {...register("code", { required: true })}
                    type="text"
                    autoFocus
                    placeholder="email or handle"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.code.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  text={"Join"}
                  className="w-full py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 px-6 text-sm"
                />
                <Link to={"/"} className="text-gray-700 text-sm underline">
                  Home
                </Link>
              </form>
            </div>
          </div>
        </>
      )}
      {!checkmate && !draw && (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
          {loading && <CenterSpinner />}
          {mode === "online" && !opponent.handle && (
            <>
              <p>Waiting for a player to join</p>
              <p>Refreshing page might take you out of the game</p>
            </>
          )}
          {resignGameMsg && (
            <>
              {/* Blur Background (whole screen) */}
              <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>

              {/* Square with Buttons (Friend Box) */}
              <div className="fixed inset-0 flex items-center justify-center z-20">
                <div className="relative w-72 h-72 bg-[#DEB887] rounded-lg shadow-lg flex flex-col items-center justify-center">
                  {/* Close Button */}
                  <button
                    onClick={() => setResignGameMsg(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  >
                    &times;
                  </button>
                  {/* Modal Content */}
                  <p className="text-gray-900 text-lg font-semibold text-center">
                    Warning! Resigning the game will affect your rating and
                    count as a loss.
                  </p>
                  <button
                    onClick={() => {
                      handleResignGame();
                    }}
                    className="mb-4 w-32 px-4 py-2  text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Resign the Game
                  </button>
                </div>
              </div>
            </>
          )}
          {opponentResigned === true && (
            <>
              {/* Blur Background (whole screen) */}
              <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>

              {/* Square with Buttons (Friend Box) */}
              <div className="fixed inset-0 flex items-center justify-center z-20">
                <div className="relative w-72 h-72 bg-[#DEB887] rounded-lg shadow-lg flex flex-col items-center justify-center">
                  {/* Close Button */}
                  <p>{opponent.handle} has resigned the game. You Won!!! 🎉</p>
                </div>
              </div>
            </>
          )}
          {!loading && !gameLoading && opponent.handle && (
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
              <Button
                text={"Resign the Game"}
                onClick={() => setResignGameMsg(true)}
                className={
                  "bg-red-500 text-white w-full py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 px-6 text-sm"
                }
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PlayGame;
