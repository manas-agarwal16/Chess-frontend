import { useEffect, useState, useMemo, useRef } from "react";
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "./components";
import { Chessboard } from "react-chessboard";
import { useDispatch } from "react-redux";
import {
  getCurrentPlayer,
  refreshAccessToken,
} from "./store/features/authSlice.js";

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [squareWidth, setSquareWidth] = useState(70); // Default square width
  // const chessboardRef = useRef(null);

  // useEffect(() => {
  //   const updateSquareWidth = () => {
  //     if (chessboardRef.current) {
  //       const boardWidth = chessboardRef.current.offsetWidth;
  //       setSquareWidth(boardWidth / 8); // 8 squares per row
  //     }
  //   };

  //   updateSquareWidth(); // Initialize square width
  //   window.addEventListener("resize", updateSquareWidth); // Update on window resize

  //   return () => {
  //     window.removeEventListener("resize", updateSquareWidth); // Cleanup event listener
  //   };
  // }, []);

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
  return (
    // <div className="bg-gray-800 min-h-screen border-blue-500 selection:bg-[#a45633]">
    <Outlet />
    // <div className="w-full h-full flex-col justify-center items-center">
    //   <Button
    //     bgColor="bg-gray-950"
    //     text={"Resign"}
    //     width="w-24"
    //     onClick={() => setResignGameMsg(true)}
    //     className={`absolute top-2 right-2 text-sm border-2 border-gray-400 px-2 py-2 text-slate-200`}
    //   />
    //   <div className="w-full px-4 mx-auto flex flex-col justify-center items-center h-screen">
    //     <p className="text-center italic text-lg text-white font-semibold mb-2">
    //       {opponent.handle?.toUpperCase()} : RATING {opponent.rating}
    //     </p>

    //     <div
    //       ref={chessboardRef}
    //       // style={{ width: "100%", height: "100%" }}
    //       className="w-full h-full max-w-[510px] mx-auto max-h-[510px] flex-col justify-center items-center"
    //     >
    //       <Chessboard
    //         id="PlayVsRandom"
    //         position={position}
    //         onPieceDrop={onDrop}
    //         boardOrientation={color}
    //         customBoardStyle={{
    //           borderRadius: "8px",
    //           // borderWidth: "2px",
    //           boxShadow: "0 4px 15px rgba(0, 0, 0, 0.7)",
    //           width: "100%",
    //           height: "100%",
    //           maxWidth: "90vw",
    //           maxHeight: "90vh",
    //           minWidth: "200px",
    //           minHeight: "200px",
    //           backgroundColor: "#f0d9b5",
    //         }}
    //         // customSquare={CustomSquareRenderer}
    //         customDarkSquareStyle={{
    //           backgroundColor: "#31363F",
    //           width: squareWidth, // Dynamically set width
    //           height: squareWidth, // Dynamically set height
    //         }}
    //         customLightSquareStyle={{
    //           backgroundColor: "#d9d7b6",
    //           width: squareWidth, // Dynamically set width
    //           height: squareWidth, // Dynamically set height
    //         }}
    //         customPieces={customPieces}
    //         onPieceDragBegin={(piece, sourceSquare) => {
    //           document.body.style.overflow = "hidden";
    //         }}
    //         onPieceDragEnd={(piece, sourceSquare, targetSquare) => {
    //           document.body.style.overflow = ""; // Restore scrolling
    //         }}
    //       />
    //     </div>
    //   </div>
    // </div>
  );
};

export default App;
