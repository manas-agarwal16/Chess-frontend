import React, { useEffect, useState } from "react";
import chessImage2 from "../assets/chess-image2.jpg";
import { Button, CenterSpinner, Heading } from "./index.js";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/features/authSlice.js";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [friendBox, setFriendBox] = useState(false);

  const { loginStatus, loading, playerData } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    console.log("loginStatus:", loginStatus);
    console.log("playerData : ", playerData);

    if (loginStatus === false && !loading) {
      navigate("/login");
    }
  }, [loginStatus, loading, navigate]);

  const handleLogout = () => {
    console.log("logout clicked");

    dispatch(logout());
  };

  const handlePlayWithStranger = () => {
    navigate(`/play-game/online`);
  };

  const handlePlayWithFriend = () => {
    console.log("play with friend clicked");
    setFriendBox(true);
  };

  return (
    <>
      {loading && <CenterSpinner />}
      {friendBox && (
        <>
          {/* Blur Background (whole screen) */}
          <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>

          {/* Square with Buttons (Friend Box) */}
          <div className="fixed inset-0 flex items-center justify-center z-20">
            <div className="relative w-72 h-72 bg-[#DEB887] rounded-lg shadow-lg flex flex-col items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setFriendBox(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
              {/* Modal Content */}
              <button
                onClick={() => {
                  navigate(`/play-game/friend-create`);
                  setFriendBox(false);
                }}
                className="mb-4 w-32 px-4 py-2  text-gray-600 bg-[#F5DEB3] rounded hover:bg-[#FFDEAD]"
              >
                Create Room
              </button>
              <button
                onClick={() => {
                  navigate(`/play-game/friend-join`);
                  setFriendBox(false);
                }}
                className="px-4 w-32 py-2 text-gray-600 bg-[#F5DEB3] rounded hover:bg-[#FFDEAD]"
              >
                Join a Room
              </button>
            </div>
          </div>
        </>
      )}
      <div className="flex min-h-screen w-screen">
        <section className="min-h-screen w-full p-0 flex-col items-center justify-center">
          <img
            className="w-full h-full shadow-2xl"
            src={chessImage2}
            alt="chess-image"
          />
        </section>
        <section className="w-full min-h-screen flex flex-col py-4 px-2 items-center justify-between">
          <div className="flex w-full justify-between items-center">
            <div></div>
            <input
              className="rounded relative left-8 border-gray-600 border-2 bg-[#FFF8DC] px-2 outline-none py-1 text-lg w-96 font-sans"
              type="text"
              placeholder="search handle"
            />
            <img
              className="rounded-full w-12 h-12 cursor-pointer border-2"
              src="https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397_1280.png"
              alt="profile-image"
            />
          </div>
          <Heading />
          <div className="flex flex-col items-center justify-center gap-10">
            <Button
              onClick={handlePlayWithStranger}
              className="text-xl border-2 border-[#F4A460]"
              text={"Play Online"}
            />
            <Button
              onClick={handlePlayWithFriend}
              className="text-xl border-2 border-[#BC8F8F]"
              text={"Play with friend"}
            />
          </div>
          <div>
            <Button
              onClick={handleLogout}
              className="text-xl border-2 w-48 bg-[#BC8F8F] not-italic border-[#BC8F8F]"
              text={"Logout"}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
