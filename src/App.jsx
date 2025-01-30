import { useEffect, useState, useMemo, useRef } from "react";
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { Button, LoadingBars } from "./components";
import { Chessboard } from "react-chessboard";
import { useDispatch } from "react-redux";
import ReactPlayer from "react-player";
import {
  getCurrentPlayer,
  refreshAccessToken,
} from "./store/features/authSlice.js";

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chessboardRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await dispatch(getCurrentPlayer());
      // console.log("res.payload here : ", res);
      if (!res.payload) {
        const refreshRes = await dispatch(refreshAccessToken());
        // console.log("res.payload of refreshAccessToken : ", refreshRes);

        if (refreshRes.payload) {
          dispatch(getCurrentPlayer());
        }
      }
    })();
  }, [dispatch]);

  // const localStream = "",
  //   remoteStream = "";

  // const customPieces = useMemo(() => {
  //   const pieces = [
  //     "wP",
  //     "wN",
  //     "wB",
  //     "wR",
  //     "wQ",
  //     "wK",
  //     "bP",
  //     "bN",
  //     "bB",
  //     "bR",
  //     "bQ",
  //     "bK",
  //   ];
  //   const pieceComponents = {};

  //   pieces.forEach((piece) => {
  //     pieceComponents[piece] = ({ squareWidth = 70 }) => (
  //       <div
  //         style={{
  //           width: squareWidth, // Dynamically sized based on square width
  //           height: squareWidth, // Keep it square
  //           backgroundImage: `url(/assets/${piece}.svg)`,
  //           backgroundSize: "contain", // Ensure it fits within the square
  //           backgroundRepeat: "no-repeat",
  //           backgroundPosition: "center",
  //         }}
  //       />
  //     );
  //   });

  //   return pieceComponents;
  // }, []);

  // const [selfMute, setSelfMute] = useState(false);
  // const [oppMute, setOppMute] = useState(false);
  // const [squareWidth, setSquareWidth] = useState(70);
  // useEffect(() => {
  //   const updateSquareWidth = () => {
  //     if (chessboardRef.current) {
  //       const boardWidth = chessboardRef.current.offsetWidth;
  //       setSquareWidth(boardWidth / 8);
  //     }
  //   };

  //   updateSquareWidth();
  //   window.addEventListener("resize", updateSquareWidth);

  //   return () => {
  //     window.removeEventListener("resize", updateSquareWidth);
  //   };
  // }, []);

  const muteAudio = () => {};
  const unmuteAudio = () => {};
  return (
    // <div className="bg-gray-800 min-h-screen border-blue-500 selection:bg-[#a45633]">
    <>
      <Outlet />
      {/* <div className="w-full px-4 mx-auto flex flex-col justify-center items-center h-screen">
        <div className="flex justify-center items-center gap-4">
          <p className="text-center italic text-lg text-white font-semibold">
            TEST : RATING 1200
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
          // style={{ width: "100%", height: "100%" }}
          className="w-full h-full max-w-[510px] mx-auto max-h-[510px] flex-col justify-center items-center border"
        >
          <Chessboard
            id="PlayVsRandom"
            // position={position}
            // onPieceDrop={onDrop}
            // boardOrientation={color}
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
            // customSquare={CustomSquareRenderer}
            customDarkSquareStyle={{
              backgroundColor: "#31363F",
              width: squareWidth, // Dynamically set width
              height: squareWidth, // Dynamically set height
            }}
            customLightSquareStyle={{
              backgroundColor: "#d9d7b6",
              width: squareWidth, // Dynamically set width
              height: squareWidth, // Dynamically set height
            }}
            customPieces={customPieces}
            onPieceDragBegin={(piece, sourceSquare) => {
              document.body.style.overflow = "hidden";
            }}
            onPieceDragEnd={(piece, sourceSquare, targetSquare) => {
              document.body.style.overflow = ""; // Restore scrolling
            }}
          />
          <div className="hidden bg-slate-700 border w-32 m-2 rounded-lg px-4 py-2  justify-between items-center mx-auto">
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
      </div> */}
    </>
  );
};

export default App;
