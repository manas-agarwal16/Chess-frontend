import React, { useEffect, useState, useRef } from "react";
// import chessImage2 from "../assets/chess-image2.jpg";
import chessImage2 from "../assets/chessmasterHomeImage.jpg";
import { Button, CenterSpinner, Heading } from "./index.js";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchPlayerRating } from "../store/features/authSlice.js";
import { FaSearch } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [friendBox, setFriendBox] = useState(false);

  const { loginStatus, loading, playerData } = useSelector(
    (state) => state.auth
  );
  const [showSearch, setShowSearch] = useState(false); // Track search bar visibility
  const searchBarRef = useRef(null); // Reference for the search bar

  // Close search bar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem("resigned", "false");
    // console.log("loginStatus:", loginStatus);
    // console.log("playerData : ", playerData);

    if (loginStatus === false && !loading) {
      navigate("/login");
    } else if (loginStatus === true && !loading) {
      dispatch(fetchPlayerRating(playerData?.id));
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

  const playerProfile = async () => {
    navigate(`/profile/${playerData?.handle}`);
  };

  const handleSearchHandle = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("searching handle...");
      navigate(`profile/${e.target.value}`);
    }
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
            <div className="relative w-72 h-72 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setFriendBox(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-400"
              >
                &times;
              </button>
              {/* Modal Content */}
              <button
                onClick={() => {
                  navigate(`/play-game/friend-create`);
                  setFriendBox(false);
                }}
                className="mb-4 w-32 px-4 py-2  text-gray-100 bg-[#BC8F8F] rounded hover:bg-[#bd8c8c]"
              >
                Create Room
              </button>
              <button
                onClick={() => {
                  navigate(`/play-game/friend-join`);
                  setFriendBox(false);
                }}
                className="px-4 w-32 py-2 text-slate-700 bg-[#a9b096] rounded hover:bg-[#aab392]"
              >
                Join a Room
              </button>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-col lg:flex-row min-h-screen w-screen">
        {/* Left Section */}
        <section className="lg:flex lg:flex-row lg:min-h-screen lg:w-3/4 min-h-[50vh] p-0 items-center justify-center hidden">
          <img
            className="w-full h-[50vh] lg:h-full object-cover shadow-2xl object-center"
            src={chessImage2}
            alt="chess-image"
          />
        </section>

        {/* Right Section */}
        <section className="w-full min-h-screen flex flex-col pt-2 items-center justify-between">
          {/* Header */}
          <div className="flex w-full justify-between items-center mb-6 pl-2 pr-4 relative">
            {/* Rating Display */}
            <div className="text-gray-200 flex">
              <span className="text-[#F4A460] inline">Rating:</span>{" "}
              <span className="ml-1">{playerData?.rating}</span>
            </div>

            {/* Search Bar for Larger Screens */}
            <input
              className="hidden md:block rounded-lg text-[#1E5162] border-blue-300 border-2 bg-gray-400 placeholder:text-slate-200 px-2 outline-none py-1 text-md w-80 font-sans"
              type="text"
              placeholder="search handle..."
              onKeyDown={handleSearchHandle}
            />

            {/* Search Icon for Mobile */}
            <div className="md:hidden flex items-center cursor-pointer">
              <FaSearch
                size={20}
                className="text-gray-200 hover:text-[#F4A460] relative right-4 transition duration-300"
                onClick={() => setShowSearch((prev) => !prev)} // Toggle search bar
              />
            </div>

            {/* Mobile Search Bar */}
            <div
              ref={searchBarRef}
              className={`absolute top-16 left-4 right-4 z-10 transition-transform duration-300 ${
                showSearch
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0 pointer-events-none"
              }`}
            >
              <input
                className="rounded-lg text-[#1E5162] border-blue-300 border-2 bg-gray-400 placeholder:text-slate-200 px-2 outline-none py-2 text-md w-full font-sans"
                type="text"
                placeholder="search handle..."
                onKeyDown={handleSearchHandle}
              />
            </div>

            {/* Profile Section */}
            <div className="pl-4 flex flex-col items-center cursor-pointer">
              <img
                onClick={playerProfile}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-500 hover:border-gray-600"
                src={
                  playerData?.avatar ??
                  "https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397_1280.png"
                }
                alt="profile-image"
              />
              <span className="text-[#F4A460] text-sm">
                {playerData?.handle}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center relative bottom-10 lg:bottom-5 flex text-gray-300  flex-col items-center gap-8">
            <div>
              <Heading />
              <p className="text-center px-4 pt-6 font-semibold text-lg">
                <span className="text-[#A0522D] inline">"</span>A chess learning
                platform that lets you communicate live with your opponent
                during games and grow together
                <span className="text-[#A0522D] inline">"</span>
              </p>
            </div>
            <p className="from-gradient-start inline-block to-gradient-end bg-clip-text text-transparent bg-gradient-to-r text-lg">
              Invite your trainer for a friendly match and prepare as a team{" "}
              <span className="inline text-white">😉</span>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 sm:gap-10 lg:gap-6">
            <Button
              onClick={handlePlayWithStranger}
              className="text-xl border-2 border-[#F4A460] max-w-72 md:max-w-96"
              text={"Play Online"}
            />
            <Button
              onClick={handlePlayWithFriend}
              className="text-xl border-2 border-[#BC8F8F] max-w-72 md:max-w-96 mx-4"
              text={"Play with friend"}
            />
          </div>

          {/* Footer */}
          <div className="w-full flex justify-end pb-4 px-4">
            <Button
              bgColor={"bg-[#A0522D]"}
              onClick={handleLogout}
              className="text-xl border-2 w-auto md:w-auto bg-[#A0522D] text-slate-200 not-italic border-[#BC8F8F]"
              text={"Logout"}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
