import React from "react";
import chessImage from "../assets/chess-image.jpg";
import { Button } from "./index.js";

const Home = () => {
  return (
    <div className="flex min-h-screen w-screen">
      <section className=" min-h-screen w-full p-1 flex-col items-center justify-center">
        <img
          className="w-full h-full rounded-xl shawdow-2xl"
          src="https://cdn.pixabay.com/photo/2017/07/10/09/47/chess-2489553_1280.jpg"
          alt="chess-image"
        />
      </section>
      <section className="w-full min-h-screen flex flex-col py-4 px-2 items-center justify-between">
        <div className="flex w-full justify-between items-center">
          <div></div>
          <input
            className="rounded relative left-8 bg-[#FFF8DC] px-2 outline-none py-1 text-lg w-96 focus:outline-gray-500 font-sans"
            type="text"
            placeholder="search handle"
          />
          <img
            className="rounded-full w-12 h-12 cursor-pointer border-2"
            src="https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397_1280.png"
            alt="profile-image"
          />
        </div>
        <h1 className="text-5xl font-bold text-[#BC8F8F]">Chess Master</h1>
        <div className="flex flex-col items-center justify-center gap-10">
          <Button className="text-xl" text={"Play with stranger"} />
          <Button className="text-xl" text={"Play with friend"} />
        </div>
        <div></div>
      </section>
    </div>
  );
};

export default Home;
