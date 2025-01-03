import React, { useState, useEffect } from "react";
import { use } from "react";
import { Chessboard } from "react-chessboard";
import { useSelector } from "react-redux";
import { socket } from "../main.jsx";

const ChessGame = () => {
  
  // const playerColor = useSelector((state) => state.playerColor);
  const playerColor = 'white';

  console.log("ChessGame", socket, playerColor);

  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState("white");

  useEffect(() => {
    socket.emit("StateOfBoard");

    socket.on("StateOfBoard", (board) => {
      console.log("Board State", board);

      setBoard(board);
    });

    socket.on("gameOver", () => {
      setGameOver(true);
      console.log(`game Over. ${turn} wins`);
    });
  }, []);

  const handleMove = (from, to) => {
    console.log("Move from", from, "to", to);

    if (turn !== playerColor) {
      return;
    }

    socket.emit("makeMove", from, to);

    setTurn(turn === "white" ? "black" : "white");
  };

  return (
    <div>
      {/* <button onClick={resetGame}>Reset Game</button> */}
      <Chessboard position={board} onPieceDrop={handleMove} boardWidth={600} />
    </div>
  );
};

export default ChessGame;
