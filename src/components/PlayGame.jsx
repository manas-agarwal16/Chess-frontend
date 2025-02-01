//webRTC not working for the first time it connects.

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { set, useForm } from "react-hook-form";
import { CenterSpinner, Input, Button, LoadingBars } from "./index.js";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { updatePlayerRating } from "../store/features/gameSlice.js";
import { use } from "react";

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
  const [calculation, setCalculation] = useState(false);

  const roomNameRef = useRef(null);
  const checkmateRef = useRef(null);
  const drawRef = useRef(null);
  const todoIdRef = useRef(null);
  const opponentRef = useRef({});
  const youRef = useRef({});

  const [squareWidth, setSquareWidth] = useState(70);
  const chessboardRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const remoteStreamRef = useRef(null);

  let emitIceCandidate = true;
  //initial PeerConnection
  useEffect(() => {
    if (!peerConnectionRef.current) {
      console.log("PeerConnection created");

      const PeerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = PeerConnection;

      // PeerConnection.onicecandidate = (event) => {
      //   console.log("got ice-candidate of the user");

      //   if (event.candidate) {
      //     console.log("event.candidate triggered");

      //     if (emitIceCandidate && roomNameRef.current) {
      //       emitIceCandidate = false;
      //       socket.emit("ice-candidate", {
      //         candidate: event.candidate,
      //         roomName: roomNameRef.current,
      //       });
      //     }
      //   }
      // };
    }
  }, []);

  //listening to remoteStream
  const handleRemoteStream = useCallback((event) => {
    console.log("handleRemoteStream called");

    const streams = event.streams;
    console.log("streams[0]: ", streams[0]);

    remoteStreamRef.current = streams[0];
    setRemoteStream(streams[0]); //video stream
  }, []);

  //access localStream send localStream to peerConnection
  const sendLocalStream = useCallback(async () => {
    console.log("sendLocalStream called");
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        setLocalStream(stream);
        console.log({ stream });
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, stream);
        });

        const PeerConnection = peerConnectionRef.current;
        PeerConnection.onicecandidate = (event) => {
          console.log("got ice-candidate of the user");

          if (event.candidate) {
            console.log("event.candidate triggered");
            if (emitIceCandidate && roomNameRef.current) {
              emitIceCandidate = false;
              socket.emit("ice-candidate", {
                candidate: event.candidate,
                roomName: roomNameRef.current,
              });
            }
          }
        };
      })
      .catch((error) => console.error("Error accessing media devices:", error));
  }, [setLocalStream]);

  //listen to remote stream
  useEffect(() => {
    peerConnectionRef.current.addEventListener("track", handleRemoteStream);
    // sendLocalStream();

    //clean up to prevent re-renders
    return () => {
      peerConnectionRef.current.removeEventListener(
        "track",
        handleRemoteStream
      );
    };
  }, [peerConnectionRef.current, handleRemoteStream]);

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
    if (sessionStorage.getItem("resigned") == "true") {
      // console.log("navigate to the home");
      navigate("/");
      return;
    }
    if (loginStatus === false && !loading) {
      navigate("/login");
    }
    if (loginStatus === true && loading === false) {
      requestFullscreen();
      console.log("user connected");
      socket.connect();
      //when user goes back <-
      return () => {
        sessionStorage.setItem("resigned", "true");
        if (!roomNameRef.current) {
          socket.emit("gameOverClearWaitings", playerData.id);

          setTimeout(() => {
            socket.disconnect();
          }, 1000);
          return;
        }

        if (!(checkmateRef.current || drawRef.current)) {
          if (playerData.id === todoIdRef.current) {
            socket.emit("updateTodoId", {
              id: opponentRef.current.id,
              roomName: roomNameRef.current,
            });
          }
          handleResignGame();
        }
      };
    }
  }, [loginStatus, loading, navigate]);

  useEffect(() => {
    console.log(
      "set square width called chessboradRef.current : ",
      chessboardRef.current
    );

    const updateSquareWidth = () => {
      if (chessboardRef.current) {
        const boardWidth = chessboardRef.current.offsetWidth;
        setSquareWidth(boardWidth / 8);
      }
    };

    updateSquareWidth();
    window.addEventListener("resize", updateSquareWidth);

    return () => {
      window.removeEventListener("resize", updateSquareWidth);
    };
  }, []);

  //game over- checkmate or draw to backend./
  useEffect(() => {
    if (game.isCheckmate()) {
      setTimeout(() => {
        // setGameLoading(() => true);
        setCalculation(() => true);
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
      setTimeout(() => {
        if (you.id === todoId) {
          console.log("checkmate from up here");
          socket.emit("checkmate", { roomName, winnerId, losserId });
        }
      }, 2000);
    }
    if (
      game.isStalemate() ||
      game.isThreefoldRepetition() ||
      game.isInsufficientMaterial()
    ) {
      setTimeout(() => {
        // setGameLoading(() => true);
        setCalculation(() => true);
      }, 1000);
      setStatus(() => "Draw");
      setTimeout(() => {
        if (you.id === todoId) {
          socket.emit("draw", { roomName });
        }
      }, 2000);
    }
  }, [game]);

  //playersInfo to backend when game starts;
  useEffect(() => {
    roomNameRef.current = roomName;

    if (
      roomName !== null &&
      you.id !== undefined &&
      opponent.id !== undefined
    ) {
      if (you.id === todoId) {
        socket.emit("playersInfo", {
          roomName: roomName,
          player1Id: you.id,
          player2Id: opponent.id,
          player1Color: color,
          player2Color: color === "white" ? "black" : "white",
          player1RatingBefore: you.rating,
          player2RatingBefore: opponent.rating,
        });
      }
    }
  }, [roomName]);

  //resign when reload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // event.preventDefault();
      // event.returnValue = "";
      sessionStorage.setItem("resigned", "true");
      if (!roomNameRef.current) {
        socket.emit("gameOverClearWaitings", playerData.id);
        socket.disconnect();
        return;
      }
      if (!(checkmateRef.current || drawRef.current)) {
        if (playerData.id === todoIdRef.current) {
          socket.emit("updateTodoId", {
            id: opponentRef.current.id,
            roomName: roomNameRef.current,
          });
        }
        handleResignGame();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup to remove the listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //userDisconnectedSuccessfully
  const handleUserDisconnected = useCallback((playerId) => {
    console.log("handleUserDisconnected called");

    if (checkmate || draw) {
      socket.disconnect();
    } else {
      if (youRef.current.id == todoIdRef.current) {
        console.log("updating todoId and leaving the game");
        socket.emit("updateTodoId", { id: opponent.id, roomName });
      }
      handleResignGame({ roomName, playerId: opponent.id });
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    const callHandleUserDisconnected = async (playerId) => {
      await handleUserDisconnected(playerId);
    };

    socket.on("userDisconnectedSuccessfully", callHandleUserDisconnected);

    return () => {
      socket.off("userDisconnectedSuccessfully", callHandleUserDisconnected);
    };
  }, [handleUserDisconnected]);

  //when user connects

  const userConnected = useCallback(() => {
    if (mode === "online") {
      setGameLoading(() => true);
      socket.emit("playWithStranger", playerData.id);
    } else {
      if (mode === "friend-create") {
        setGameLoading(() => true);
        socket.emit("createRoom", playerData.id);
      } else {
        setEnterCode(() => true);
      }
    }
  }, [setGameLoading, setEnterCode, mode]);

  useEffect(() => {
    const callUserConnected = async () => {
      await userConnected();
    };
    socket.on("connect", callUserConnected);

    return () => {
      socket.off("connect", callUserConnected);
    };
  }, [userConnected]);

  socket.on("updateTodoIdFromBackend", (id) => {
    setTodoId(() => id);
  });

  //ask to enter code
  socket.on("askToEnterCode", (uniqueCode) => {
    setAskToEnterCode(true);
    setGameLoading(() => false);
    setCode(uniqueCode);
  });

  //invalid friend code
  socket.on("invalidCode", () => {
    // console.log("invalid code");
    setGameLoading(() => false);
    setError("code", {
      type: "manual",
      message: "Invalid Code",
    });
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
    setGameLoading(() => false);
    console.log("Waiting for a player to join: ", roomName);
  });

  const handleStartGame = useCallback(
    async (players) => {
      console.log("handleStartGame called");

      await sendLocalStream();

      roomNameRef.current = players.roomName;
      todoIdRef.current = players.todoId;
      opponentRef.current =
        players.player1.id === playerData.id
          ? players.player2
          : players.player1;

      youRef.current =
        players.player1.id === playerData.id
          ? players.player1
          : players.player2;
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
    },
    [
      sendLocalStream,
      setTodoId,
      setAskToEnterCode,
      setEnterCode,
      setRoomName,
      setColor,
      setYou,
      setOpponent,
      setGameLoading,
    ]
  );

  //start the game
  useEffect(() => {
    const callHandleStartGame = async (players) => {
      await handleStartGame(players);
    };

    socket.on("startTheGame", callHandleStartGame);
    return () => {
      socket.off("startTheGame", callHandleStartGame);
    };
  }, [handleStartGame]);

  useEffect(() => {
    if (!peerConnectionRef.current) return;

    const PeerConnection = peerConnectionRef.current;

    const createOffer = async () => {
      if (!PeerConnection) return;
      const offer = await PeerConnection.createOffer();
      await PeerConnection.setLocalDescription(offer);
      socket.emit("offer", {
        offer: PeerConnection.localDescription,
        roomName: roomNameRef.current,
      });
    };

    if (todoIdRef.current === playerData.id) {
      createOffer();
    }
    // Receive offer
    socket.on("offer", async ({ offer, roomName }) => {
      if (!PeerConnection) return;
      // console.log("Received offer", offer);

      try {
        // Set the remote description as the offer
        await PeerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        // console.log("Remote description set successfully");

        // Create and send the answer
        const answer = await PeerConnection.createAnswer();
        await PeerConnection.setLocalDescription(answer);
        // console.log("Answer created and local description set");

        socket.emit("answer", {
          roomName: roomName,
          answer: PeerConnection.localDescription,
        });
      } catch (error) {
        console.error("Error while handling offer", error);
      }
    });

    // Receive answer
    socket.on("answer", async ({ roomName, answer }) => {
      if (!PeerConnection) return;
      // console.log("Received answer for room", roomName);

      try {
        // Set the remote description as the answer
        await PeerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        // console.log("Remote description set successfully for answer");
      } catch (error) {
        console.error("Error while handling answer", error);
      }
    });

    //ice-candidate
    socket.on("ice-candidate", async ({ candidate }) => {
      if (!PeerConnection) return;
      console.log("ice-candidate: ", candidate);
      console.log(
        "peerConnection signaling state: ",
        PeerConnection.signalingState
      );
      console.log(
        "peerConnection iceconnection state: ",
        PeerConnection.iceConnectionState
      );

      try {
        await PeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.log("ice-candidate error: ", error);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [todoIdRef?.current]);

  //backend makeMove
  const handleMakeMove = useCallback(
    (newPosition) => {
      console.log("handleMakeMove called");

      setPosition(() => newPosition);
      setGame(() => new Chess(newPosition));
    },
    [setPosition, setGame]
  );

  useEffect(() => {
    const callHandleMakeMove = async (newPosition) => {
      handleMakeMove(newPosition);
    };
    socket.on("makeMove", callHandleMakeMove);
    return () => {
      socket.off("makeMove", callHandleMakeMove);
    };
  }, [handleMakeMove]);

  // backend itsCheckmate
  const handleCheckmate = useCallback(
    ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
      player1Id,
      player2Id,
    }) => {
      console.log("checkmate from backend");

      setYouNewRatinng(() =>
        you.id === player1Id ? player1RatingAfter : player2RatingAfter
      );
      setOpponentNewRating(() =>
        opponent.id === player1Id ? player1RatingAfter : player2RatingAfter
      );
      setCheckmate(() => true);
      checkmateRef.current = true;

      dispatch(
        updatePlayerRating(
          you.id === player1Id ? player1RatingAfter : player2RatingAfter
        )
      );

      // console.log("disconnected");
      socket.emit("gameOverClearWaitings", you.id);
      // setGameLoading(() => false);
      setCalculation(() => false);
      socket.disconnect();
    },
    [setYouNewRatinng, setOpponentNewRating, setCheckmate, setCalculation]
  );

  useEffect(() => {
    const callHandleCheckmate = async ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
      player1Id,
      player2Id,
    }) => {
      await handleCheckmate({
        player1RatingBefore,
        player1RatingAfter,
        player2RatingBefore,
        player2RatingAfter,
        player1Id,
        player2Id,
      });
    };
    socket.on("itsCheckmate", callHandleCheckmate);

    return () => {
      socket.off("itsCheckmate", callHandleCheckmate);
    };
  }, [handleCheckmate]);

  //backend itsDraw
  const handleDraw = useCallback(
    ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
      player1Id,
      player2Id,
    }) => {
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
      drawRef.current = true;

      socket.emit("gameOverClearWaitings", you.id);
      // setGameLoading(() => false);
      setCalculation(() => false);
      socket.disconnect();
    },
    [setYouNewRatinng, setOpponentNewRating, setDraw, setCalculation]
  );

  useEffect(() => {
    const callHandleDraw = async ({
      player1RatingBefore,
      player1RatingAfter,
      player2RatingBefore,
      player2RatingAfter,
      player1Id,
      player2Id,
    }) => {
      await handleDraw({
        player1RatingBefore,
        player1RatingAfter,
        player2RatingBefore,
        player2RatingAfter,
        player1Id,
        player2Id,
      });
    };
    socket.on("itsDraw", callHandleDraw);

    return () => {
      socket.off("itsDraw", callHandleDraw);
    };
  }, [handleDraw]);

  //backend
  const functionResignedGame = useCallback(
    ({ roomName, playerId }) => {
      console.log("resignedGame called");
      setResignGameMsg(() => false);

      if (youRef.current?.id != null && opponentRef.current?.id != null) {
        if (youRef.current.id === playerId) {
          console.log("you resigned the game");
          setCalculation(true);
        } else {
          console.log("opponent resigned the game");
          setOpponentResigned(true);
        }

        setTimeout(() => {
          setCalculation(true);
          setOpponentResigned(false);
          setStatus(youRef.current.id === playerId ? "Lost" : "Won");

          if (youRef.current.id === todoIdRef.current) {
            console.log("checkmate from down here");

            socket.emit("checkmate", {
              roomName,
              winnerId:
                youRef.current.id === playerId
                  ? opponentRef.current.id
                  : youRef.current.id,
              losserId: playerId,
            });
          }
        }, 3000);
      }
    },
    [
      setCalculation,
      setOpponentResigned,
      setStatus,
      youRef,
      opponentRef,
      todoIdRef,
      setResignGameMsg,
    ]
  );

  useEffect(() => {
    const callFunctionResignedGame = async ({ roomName, playerId }) => {
      await functionResignedGame({ roomName, playerId });
    };

    socket.on("resignedGame", callFunctionResignedGame);

    return () => {
      socket.off("resignedGame", callFunctionResignedGame);
    };
  }, [functionResignedGame]);

  //custom chess pieces
  const customPieces = useMemo(() => {
    const pieces = [
      "wP",
      "wN",
      "wB",
      "wR",
      "wQ",
      "wK",
      "bP",
      "bN",
      "bB",
      "bR",
      "bQ",
      "bK",
    ];
    const pieceComponents = {};

    pieces.forEach((piece) => {
      pieceComponents[piece] = ({ squareWidth = 70 }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/assets/${piece}.svg)`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      );
    });

    return pieceComponents;
  }, []);

  //join room
  const handleEnteredCode = ({ code }) => {
    console.log("entered code : ", code);
    setGameLoading(() => true);
    socket.emit("joinRoom", { code, playerId: playerData.id });
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    let pieceColor = piece[0] == "w" ? "white" : "black";

    if (pieceColor !== color) {
      return false;
    }

    const gameCopy = new Chess(game.fen());

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q", // always promote to a queen for example simplicity
      });

      if (move === null) {
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

  //working handleResignGame running 1 time only
  const handleResignGame = useCallback(() => {
    console.log("resigning the game");

    setResignGameMsg(() => false);
    socket.emit("resignGame", {
      roomName: roomNameRef.current,
      playerId: playerData.id,
    });
  }, [setResignGameMsg]);

  const handleCleanUp = () => {
    socket.emit("userDisconnected", { playerId: playerData.id, roomName });
    setTimeout(() => {
      navigate("/");
    }, 400);
  };

  const [selfMute, setSelfMute] = useState(false);
  const [oppMute, setOppMute] = useState(false);

  //mute opponent remoteStream

  const handleMuteAudio = useCallback(() => {
    console.log("handleMuteAudio called");
    if (
      remoteStreamRef.current &&
      remoteStreamRef.current.getAudioTracks().length > 0
    ) {
      remoteStreamRef.current.getAudioTracks()[0].enabled = false;
      console.log("Remote audio muted");
    } else {
      console.log("remoteStreamRef.current is null or has no audio tracks");
    }
  }, []);

  useEffect(() => {
    const callMuteAudio = async () => {
      await handleMuteAudio();
    };
    socket.on("muteAudio", callMuteAudio);

    return () => {
      socket.off("muteAudio", callMuteAudio);
    };
  }, [handleMuteAudio]);

  const muteAudio = async () => {
    socket.emit("muteAudio", { roomName });
    setSelfMute(true);
  };

  // socket.on("muteAudio", handleMuteAudio);

  const handleUnmuteAudio = useCallback(() => {
    console.log("handleUnmuteAudio called");
    if (
      remoteStreamRef.current &&
      remoteStreamRef.current.getAudioTracks().length > 0
    ) {
      remoteStreamRef.current.getAudioTracks()[0].enabled = true;
      console.log("Remote audio unmuted");
    } else {
      console.log("remoteStreamRef.current is null or has no audio tracks");
    }
  }, []);

  //unmute opponent remoteStream
  const unmuteAudio = () => {
    console.log("unmute my audio");
    socket.emit("unmuteAudio", { roomName });
    setSelfMute(false);
  };

  useEffect(() => {
    const callHandleUnmuteAudio = async () => {
      await handleUnmuteAudio();
    };
    socket.on("unmuteAudio", callHandleUnmuteAudio);

    return () => {
      socket.off("unmuteAudio", callHandleUnmuteAudio);
    };
  }, [handleUnmuteAudio]);

  // socket.on("unmuteAudio", handleUnmuteAudio);

  return (
    <>
      {gameLoading && !opponentResigned && <CenterSpinner />}
      {calculation && (
        <>
          <LoadingBars />
        </>
      )}
      {(checkmate || draw) && !calculation && (
        <>
          <div className="h-screen bg- w-full  flex items-center justify-center">
            {/* Player Info Section */}
            <div
              className={`flex flex-col items-center justify-center space-y-6 p-6 bg-gray-300 shadow-lg rounded-lg w-1/3 ${
                status === "Won" ? "bg-white" : "bg-gray-300"
              }`}
            >
              <div className={`flex flex-col items-center space-y-2 `}>
                <span className="text-xl font-bold text-gray-800">
                  {you.handle.toUpperCase()}
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
            <div
              className={`flex flex-col bg-gray-300 items-center justify-center space-y-6 p-6 shadow-lg rounded-lg w-1/3 ${
                status === "Lost" ? "bg-white" : "bg-gray-300"
              }`}
            >
              <div className={`flex flex-col items-center space-y-2 `}>
                <span className="text-xl font-bold text-gray-800">
                  {opponent.handle.toUpperCase()}
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
            <div className="relative w-72 h-72 bg-[#BC8F8F] rounded-lg shadow-lg flex flex-col items-center justify-center gap-4">
              {/* Close Button */}
              <button
                onClick={handleCleanUp}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                &times;
              </button>
              {/* Modal Content */}
              <p className="text-slate-600 font-semibold text-center">
                Ask Your Friend To Enter The Code:{" "}
              </p>
              <p className="text-gray-700 bg-gray-300 w-32 rounded text-center">
                {code}
              </p>
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
            <div className="relative w-72 h-72 bg-[#a9b096] rounded-lg shadow-lg flex flex-col items-center justify-center">
              {/* Enter code form */}
              <button
                onClick={() => navigate("/")}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
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
                    type="number"
                    autoFocus
                    placeholder="Enter your code"
                    bgColor="bg-slate-200"
                    className="w-full p-2 border appearance-none rounded-md bg-slate-100 focus:outline-none focus:ring-2 text-slate-800 placeholder:text-slate-400"
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
                  bgColor="bg-[#a9b096] text-gray-"
                  className="w-full py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 px-6 text-sm bg-[#e9f8c178] text-slate-600"
                />
              </form>
            </div>
          </div>
        </>
      )}
      {!calculation && !checkmate && !draw && (
        <div className="h-screen min-w-screen flex flex-col items-center justify-center">
          {loading && <CenterSpinner />}
          {mode === "online" && !opponent.handle && (
            <>
              <p className="text-gray-500 text-2xl py-4">
                Waiting for a player to join...
              </p>
              <p className="text-gray-400 text-sm text-center mx-4">
                {" "}
                <span className="text-slate-400 inline-block font-semibold text-md">
                  Note:{" "}
                </span>{" "}
                Refreshing the page during the game will be treated as a
                resignation. Please ensure a stable connection.
              </p>
            </>
          )}
          {resignGameMsg && (
            <>
              {/* Blur Background (whole screen) */}
              <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>

              {/* Square with Buttons (Friend Box) */}
              <div className="fixed inset-0 flex items-center justify-center z-20">
                <div className="relative w-72 h-72 bg-gray-950 text-gray-300 rounded-lg shadow-lg flex flex-col items-center justify-center">
                  {/* Close Button */}
                  <button
                    onClick={() => setResignGameMsg(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  >
                    &times;
                  </button>
                  {/* Modal Content */}
                  <p className="p-3 text-lg font-semibold text-center mb-2">
                    <span className="text-red-600">WARNING!</span> Resigning the
                    game will affect your rating and count as a loss.
                  </p>
                  <Button
                    // onClick={handleResignGame}
                    onClick={(event) => {
                      event.stopPropagation(); // Prevent bubbling
                      handleResignGame(); // Call the handler safely
                    }}
                    bgColor="bg-gray-950"
                    text={"Resign"}
                    width="w-24"
                    className="text-sm border-2 border-gray-400 px-2 py-2 text-slate-200"
                  />
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
                <div className="relative w-72 h-72 bg-[#BC8F8F] rounded-lg shadow-lg flex flex-col items-center justify-center">
                  {/* Close Button */}
                  <p className="text-center p-3 text-lg font-semibold text-gray-200">
                    {opponent.handle?.toUpperCase()} has resigned the game. You
                    Won!!! 🎉
                  </p>
                </div>
              </div>
            </>
          )}
          {!loading && !calculation && opponent.handle && (
            <div className="w-full h-full flex-col justify-center items-center">
              <Button
                bgColor="bg-gray-950"
                text={"Resign"}
                width="w-24"
                onClick={() => setResignGameMsg(true)}
                className={`absolute top-2 right-2 text-sm border-2 border-gray-400 px-2 py-2 text-slate-200`}
              />
              <div className="w-full px-4 mx-auto flex flex-col justify-center items-center h-screen">
                <div className="flex justify-center items-center gap-4">
                  <p className="text-center italic text-lg text-white font-semibold">
                    {opponent.handle?.toUpperCase()} : RATING {opponent.rating}
                  </p>
                  <div className="flex mx-auto bg-slate-700 w-24 m-2 rounded-lg px-4 py-2  justify-between items-center">
                    <div className="border hidden">
                      <ReactPlayer
                        playing
                        url={localStream}
                        muted
                        width="0px"
                        height="0px"
                      />
                      <ReactPlayer
                        playing
                        url={remoteStream}
                        muted={oppMute}
                        width="0px"
                        height="0px"
                      />
                    </div>
                    {!selfMute && (
                      <i
                        onClick={muteAudio}
                        className="fas fa-microphone cursor-pointer"
                      ></i>
                    )}
                    {selfMute && (
                      <i
                        onClick={unmuteAudio}
                        className="fas fa-microphone-slash cursor-pointer"
                      ></i>
                    )}
                    {oppMute && (
                      <i
                        onClick={() => setOppMute(false)}
                        className="fas fa-volume-mute cursor-pointer"
                      ></i>
                    )}
                    {!oppMute && (
                      <i
                        onClick={() => setOppMute(true)}
                        className="fas fa-volume-up cursor-pointer"
                      ></i>
                    )}
                  </div>
                </div>

                <div
                  ref={chessboardRef}
                  className="w-full h-full max-w-[510px] mx-auto max-h-[510px] flex-col justify-center items-center"
                >
                  <Chessboard
                    id="PlayVsRandom"
                    position={position}
                    onPieceDrop={onDrop}
                    boardOrientation={color}
                    customBoardStyle={{
                      borderRadius: "8px",
                      // borderWidth: "2px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.7)",
                      width: "100%",
                      height: "100%",
                      maxWidth: "90vw",
                      maxHeight: "90vh",
                      minWidth: "200px",
                      minHeight: "200px",
                      backgroundColor: "#f0d9b5",
                    }}
                    customDarkSquareStyle={{
                      backgroundColor: "#31363F",
                      width: squareWidth,
                      height: squareWidth,
                    }}
                    customLightSquareStyle={{
                      backgroundColor: "#d9d7b6",
                      width: squareWidth,
                      height: squareWidth,
                    }}
                    customPieces={customPieces}
                    onPieceDragBegin={(piece, sourceSquare) => {
                      document.body.style.overflow = "hidden";
                    }}
                    onPieceDragEnd={(piece, sourceSquare, targetSquare) => {
                      document.body.style.overflow = ""; // Restore scrolling
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PlayGame;
