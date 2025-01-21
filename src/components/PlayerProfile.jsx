import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../utils/axiosInstance";
import CenterSpinner from "./CenterSpinner";
import { Spinner } from "./index.js";
import Heading from "./Heading";
import "../App.css";
import { Link } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const PlayerProfile = () => {
  const { handle } = useParams();
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [profileHandle, setProfileHandle] = useState(null);
  const [profileEmail, setProfileEmail] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [profileRating, setProfileRating] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);

  const { playerData } = useSelector((state) => state.auth);
  const [showMatch, setShowMatch] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [matchDetails, setMatchDetails] = useState({});
  const [squareWidth, setSquareWidth] = useState(70);
  const chessboardRef = useRef(null);

  //dates and ratings scores for chart
  const [dates, setDates] = useState([]);
  const [scores, setScores] = useState([]);

  const ratings = [
    // { date: "2025-01-01", rating: 1200 },
    // { date: "2025-01-15", rating: 1250 },
    // { date: "2025-02-01", rating: 1300 },
    // { date: "2025-02-15", rating: 1250 },
  ];

  // const dates = ratings.map((item) => item.date); // Example: ["2025-01-01", "2025-01-10"]
  // const scores = ratings.map((item) => item.rating); // Example: [1200, 1250, 1300]

  const navigate = useNavigate();
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        let res = await axiosInstance.get(
          `/players/profile/${handle}?page=${page}`
        );
        res = res?.data?.data;
        // console.log("res.matches: ", res?.matches);
        console.log("res: ", res);

        setMatchLoading(() => false);
        if (res === null || res === undefined) {
          setProfileLoading(() => false);
          setProfileNotFound(() => true);
          return;
        } else if (page === 1) {
          setProfileLoading(() => false);
          setProfileEmail(() => res.email);
          setProfileHandle(() => res.handle);
          setProfileAvatar(() => res.avatar);
          setProfileRating(() => res.rating);
          setProfileId(() => res.id);
          setDates(() => res.ratingHistory.map((item) => item.date));
          setScores(() => res.ratingHistory.map((item) => item.rating));
        }
        if (res.matches.length < 5) {
          setMore(false);
        }
        setMatches((prev) => [...prev, ...res.matches]);
        // console.log("res: ", res?.data?.data);
      } catch (error) {
        console.log("error fetching matches : ", error);
        setProfileLoading(() => false);
        setProfileNotFound(() => true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    };
    fetchMatches();
  }, [page]);

  console.log("dates: ", dates);

  const handleClickMore = () => {
    setMatchLoading(() => true);
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (matchId === null) return;
    (async () => {
      let res = await axiosInstance.get(
        `players/view-match/${matchId}/${profileId}`
      );
      console.log("res.data: ", res.data);
      res = res.data?.data;
      setMatchDetails(() => res);
    })();
  }, [matchId]);

  const handleViewMatch = (matchId) => {
    setMatchId(() => matchId);
    setShowMatch(() => true);
  };

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
            width: squareWidth, // Dynamically sized based on square width
            height: squareWidth, // Keep it square
            backgroundImage: `url(/assets/${piece}.svg)`,
            backgroundSize: "contain", // Ensure it fits within the square
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      );
    });

    return pieceComponents;
  }, []);

  useEffect(() => {
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

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Player Ratings",
        data: scores,
        borderColor: "#4ade80", // Tailwind's green-400
        backgroundColor: "rgba(74, 222, 128, 0.2)", // Light green
        pointBorderColor: "#16a34a", // Tailwind's green-600
        // tension: 0, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date and Time",
        },
        ticks: {
          display: false, // Disable the x-axis labels
        },
      },
      y: {
        title: {
          display: false,
          text: "Rating",
        },
        min: 1100,
        max: 2000,
        ticks: {
          callback: function (value) {
            const ratings = [1200, 1400, 1600, 1800, 1900, 2000];
            if (ratings.includes(value)) {
              return value;
            }
            return "";
          },
        },
      },
    },
  };

  return (
    <>
      {/* {profileLoading && (
        <div className="flex justify-center items-center col-span-full">
          <CenterSpinner width={10} />
        </div>
      )} */}
      {profileNotFound && (
        <div className="min-h-screen min-w-screen flex justify-center items-center text-2xl text-white font-semibold">
          No player found with this handle.{" "}
        </div>
      )}
      <div>
        {!profileNotFound && (
          <>
            {showMatch && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-30 backdrop-blur-[2px] overflow-y-auto">
                <button
                  onClick={() => {
                    setShowMatch(false);
                    setMatchDetails({});
                    setMatchId(null);
                  }}
                  className="md:hidden absolute top-5 mb-4 right-2 md:right-4 text-gray-300 hover:text-gray-400"
                >
                  &times;
                </button>
                <div className="relative w-full max-w-3xl h-[90vh] mx-4 background-blur rounded-md overflow-y-auto shadow-lg flex flex-col hide-scrollbar pt-4">
                  <button
                    onClick={() => {
                      setShowMatch(false);
                      setMatchDetails({});
                      setMatchId(null);
                    }}
                    className="hidden md:block absolute top-0 mb-4 right-2 md:right-4 text-gray-300 hover:text-gray-400"
                  >
                    &times;
                  </button>
                  {matchDetails?.history?.map((pos, index) => (
                    <div
                      ref={chessboardRef}
                      key={index}
                      className="w-full h-auto max-w-[510px] mx-auto my-4"
                    >
                      <Chessboard
                        id="PlayVsRandom"
                        position={pos}
                        arePiecesDraggable={false}
                        boardOrientation={matchDetails?.color}
                        customBoardStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.7)",
                          backgroundColor: "#f0d9b5",
                        }}
                        customDarkSquareStyle={{
                          backgroundColor: "#31363F",
                        }}
                        customLightSquareStyle={{
                          backgroundColor: "#d9d7b6",
                        }}
                        customPieces={customPieces}
                      />
                    </div>
                  ))}
                  <div className="h-10 text-center mx-auto border bg-gray-800 w-72 md:w-80 lg:w-96 xl:w-1/2"></div>
                </div>
              </div>
            )}

            <div className="min-h-screen w-full text-gray-200">
              <div
                onClick={() => navigate("/")}
                className="absolute cursor-pointer pt-2 px-2 text-center"
              >
                <Heading className="text-3xl text-[#A0522D] pt-0 font-semibold my-0 inline-block" />
              </div>

              <div className="flex flex-col justify-between px-10">
                <div className=" border-red-600 py-4 flex gap-3 justify-center items-center">
                  <img
                    className="rounded-full text-center w-80 h-80"
                    src={profileAvatar}
                    alt="player-avatar"
                  />
                </div>
                <div className="w-full h-96 mx-auto border flex items-center justify-center">
                  <Line data={data} options={options} />
                </div>
                <div className="py-2 px-4 flex justify-center items-center  gap-8 text-white text-lg ">
                  <h1>
                    {" "}
                    <span className="text-[#A0522D] font-semibold text-xl inline-block">
                      Handle:
                    </span>{" "}
                    {profileHandle}
                  </h1>
                  <h2 className="text-center">
                    <span className="text-[#A0522D] font-semibold text-xl inline-block">
                      Email:
                    </span>{" "}
                    {profileEmail}
                  </h2>
                  <h2 className="text-center">
                    <span className="text-[#A0522D] font-semibold text-xl inline-block">
                      Rating:
                    </span>{" "}
                    {profileRating}
                  </h2>
                </div>
                <div className="w-40"></div>
              </div>
              <div className="px-4">
                <h1 className="text-2xl  text-blue-600">MATCHES: </h1>
                {matches?.length === 0 && (
                  <div className="mt-4 h-[25vh] md:h-[40vh] lg:h-[20vh] xl:h-[15vh] flex justify-center items-center text-center p-4">
                    <h1 className="text-center text-xl text-gray-300">
                      {playerData?.handle === profileHandle
                        ? "Currently, no game participation has been recorded for you. We are excited to see your upcoming matches."
                        : "At this moment, the player not participated in any matches. We look forward to seeing their future engagements.."}
                    </h1>
                  </div>
                )}
                {matches?.length > 0 && (
                  <ul className="text-white">
                    {matches?.map((match) => {
                      return (
                        <li
                          onClick={() => handleViewMatch(match.id)}
                          key={match.id}
                          className="border bg-gray-900 py-2 flex flex-col md:flex-row justify-between rounded px-4 md:py-4 my-3 gap-4 cursor-pointer hover:bg-[#121825] text-gray-200"
                        >
                          <div className="flex flex-col items-center justify-center md:w-1/3">
                            <h1 className="text-start w-56 md:w-auto">
                              <span className="text-gray-300 text-md text-center inline-block font-semibold">
                                Opponent:
                              </span>
                              <span className="text-[#F5DEB3] text-center">
                                {" "}
                                {match.opponentHandle.toUpperCase()} •{" "}
                                <span className="text-sm text-center inline-block">
                                  {match.opponentRatingBefore} &rarr;{" "}
                                  {match.opponentRatingAfter}
                                </span>
                              </span>
                            </h1>
                          </div>

                          <div className="flex flex-col items-center justify-center md:w-1/4">
                            <h2 className="text-start w-56 md:w-auto">
                              <span className="text-gray-300 text-center inline-block text-md font-semibold">
                                Result:
                              </span>
                              <span
                                className={`text-sm text-center ${
                                  match.result === "Lost"
                                    ? "text-red-500"
                                    : "text-green-600"
                                }`}
                              >
                                {" "}
                                {match.result.toUpperCase()}
                              </span>
                            </h2>
                          </div>

                          <div className="flex flex-col items-center justify-center md:w-1/4">
                            <h2 className="text-start w-56 md:w-auto">
                              <span className="text-gray-300 text-center inline-block text-md font-semibold">
                                Rating Before:
                              </span>{" "}
                              <span className="font-semibold text-sm inline-block text-center text-[#F5DEB3]">
                                {" "}
                                {match.playerRatingBefore}
                              </span>
                            </h2>
                          </div>

                          <div className="flex flex-col items-center justify-center md:w-1/4">
                            <h2 className="text-start w-56 md:w-auto">
                              <span className="text-gray-300 text-center inline-block text-md font-semibold">
                                Rating After:
                              </span>
                              <span
                                className={`text-sm text-center font-semibold ${
                                  match.result === "Lost"
                                    ? "text-red-500"
                                    : "text-green-600"
                                }`}
                              >
                                {" "}
                                {match.playerRatingAfter}
                              </span>
                              {match.playerRatingAfter !== "pending" && (
                                <span
                                  className={`text-sm text-center font-semibold ${
                                    match.result === "Lost"
                                      ? "text-red-500"
                                      : "text-green-600"
                                  }`}
                                >
                                  {" "}
                                  (
                                  {match.playerRatingAfter >=
                                  match.playerRatingBefore
                                    ? `+${
                                        match.playerRatingAfter -
                                        match.playerRatingBefore
                                      }`
                                    : `-${
                                        match.playerRatingBefore -
                                        match.playerRatingAfter
                                      }`}
                                  )
                                </span>
                              )}
                            </h2>
                          </div>

                          <div className="flex flex-col items-center justify-center md:w-1/4">
                            <h2
                              className={`text-start w-56 md:w-auto ${
                                match.status === "finished"
                                  ? "text-green-400"
                                  : "text-yellow-200"
                              }`}
                            >
                              <span className="text-gray-300 text-center font-semibold">
                                Status:{" "}
                              </span>{" "}
                              • {match.status}
                            </h2>
                          </div>
                        </li>
                      );
                    })}
                    {matchLoading && (
                      <div>
                        <Spinner />
                      </div>
                    )}
                    {!matchLoading && more && (
                      <Link
                        onClick={handleClickMore}
                        className="text-blue-400 cursor-pointer relative bottom-2"
                      >
                        more...
                      </Link>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PlayerProfile;
