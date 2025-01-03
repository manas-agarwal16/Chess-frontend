import { useState } from "react";
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { socket } from "./main.jsx";

const App = () => {
  const navigate = useNavigate();

  const [id, setId] = useState(6);

  const handlePlayWithStranger = () => {
    console.log("Play with stranger : ", socket);

    socket.emit("playWithStranger", id);
    setId((prev) => prev + 1);

    //clear
    socket.on("WaitingForAPlayer", () => {
      console.log("Waiting for a player to join");
    });

    //clear
    socket.on("startTheGame", (player1, player2) => {
      console.log("player1 , player2 joined the room: ", player1, player2);

      //if getCurrentPlayer is player1 then playerColor = player1.color in socketSlice else playerColor = player2.color.

      navigate("/play");
    });
  };

  return (
    <div className="bg-[#DEB887]">
      <Outlet/>
    </div>
  );
};

export default App;
