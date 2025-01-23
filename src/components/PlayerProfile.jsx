import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../utils/axiosInstance";
import CenterSpinner from "./CenterSpinner";
import { Spinner, Button } from "./index.js";
import Heading from "./Heading";
import "../App.css";
import { Link } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import toast from "react-hot-toast";

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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [profileHandle, setProfileHandle] = useState(null);
  const [profileEmail, setProfileEmail] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [profileRating, setProfileRating] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
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

  // const {
  //   register,
  //   handleSubmit,
  //   reset,
  //   formState: { errors },
  // } = useForm();

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
          setTotalMatches(() => res.totalMatches);
          setWins(() => res.wins);
          setLosses(() => res.losses);
          setDraws(() => res.draws);
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

  // console.log("dates: ", dates);

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
        label: "Ratings",
        data: scores,
        borderColor: "#facc15", // Tailwind's amber-400 for a striking chess-themed look
        backgroundColor: "rgba(250, 204, 21, 0.2)", // A soft amber with transparency
        pointBorderColor: "#fde047", // Tailwind's yellow-300 for points
        pointBackgroundColor: "#facc15", // Match the line color
        pointRadius: 2, // Slightly larger points for emphasis
        pointHoverRadius: 6, // Highlight points on hover
        borderWidth: 2, // Thinner line
        tension: 0.3, // Smooth curve, slightly less tension for sharper insights
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to resize freely
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#e5e5e5", // Tailwind's gray-200 for text color
          font: {
            size: 12, // Slightly larger legend text
          },
        },
      },
      // tooltip: {
      //   enabled: true,
      //   backgroundColor: "#374151", // Tailwind's gray-700 for a dark tooltip
      //   titleColor: "#f5f5f5", // White tooltip title
      //   bodyColor: "#d1d5db", // Tailwind's gray-300 for the body text
      //   borderColor: "#facc15", // Tailwind's amber-400 for border
      //   borderWidth: 1,
      // },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date and Time",
          color: "#e5e5e5", // Tailwind's gray-200
          font: {
            size: 12,
            weight: "bold",
          },
        },
        ticks: {
          display: false, // Show x-axis labels
        },
        grid: {
          display: false, // Hide vertical grid lines
        },
      },
      y: {
        title: {
          display: true,
          // text: "R a t i n g s",
          padding: "2px",
          color: "#e5e5e5", // Tailwind's gray-200
          font: {
            size: 12,
            weight: "bold",
          },
        },
        min: 1100,
        max: 2000,
        ticks: {
          color: "#d1d5db", // Tailwind's gray-300
          font: {
            size: 12,
          },
          callback: function (value) {
            const ratings = [1200, 1400, 1600, 1800, 1900, 2000];
            return ratings.includes(value) ? value : ""; // Only display specific ratings
          },
        },
        grid: {
          color: "#525252", // Tailwind's gray-600 for subtle grid lines
          borderDash: [4, 4], // Dashed lines for better aesthetics
        },
      },
    },
  };

  const updateAvatar = async (e) => {
    console.log("e.target.files: ", e.target.files);

    const avatar = e.target.files[0];
    console.log("avatar: ", avatar);

    const avatarAndPresetName = new FormData();
    avatarAndPresetName.append("file", avatar);
    avatarAndPresetName.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_PRESET_NAME
    );
    let data;
    try {
      setProfileLoading(() => true);
      data = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        avatarAndPresetName
      );
      console.log(
        "data after deploying avatar to cloudinary: ",
        data?.data?.secure_url
      );

      await axiosInstance.put(`/players/update-avatar/`, {
        avatarURL: data?.data?.secure_url,
        id: playerData.id,
      });

      setProfileLoading(() => false);
      toast.success(
        "Avatar updated successfully. Refresh the page to see changes.",
        {
          duration: 4000,
        }
      );
    } catch (error) {
      console.log("error deploying avatar to cloudinary: ", error);
    }
  };

  return (
    <>
      {profileLoading && (
        <div className="flex justify-center items-center col-span-full">
          <CenterSpinner width={10} />
        </div>
      )}
      <div className="cursor-pointer" onClick={() => navigate("/")}>
        <Heading />
      </div>
      {profileNotFound && (
        <div className="min-h-screen min-w-screen flex justify-center items-center text-2xl text-white font-semibold">
          No player found with this handle.{" "}
        </div>
      )}
      <div className="">
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
              {/* <div
                onClick={() => navigate("/")}
                className="absolute cursor-pointer pt-2 px-2 text-center"
              >
                <Heading className="text-3xl text-[#A0522D] pt-0 font-semibold my-0 inline-block" />
              </div> */}

              {/* <div className="flex items-center justify-center"> */}
              <div className="flex flex-col justify-between px-4">
                <div className="flex flex-col items-center justify-between">
                  <div className="py-4 w-full flex justify-center md:justify-center gap-2 items-center">
                    <div className="relative w-full md:w-1/3 h-52 md:h-60 lg:h-72 xl:h-80 bg-gray-800 rounded-lg shadow-lg flex p-4 items-center justify-center">
                      {playerData?.handle === profileHandle && (
                        <div className="absolute top-2 right-2 md:right-4">
                          <label htmlFor="avatar" className="cursor-pointer">
                            &#9998;
                          </label>
                          <input
                            onChange={updateAvatar}
                            type="file"
                            id="avatar"
                            className="hidden"
                          />
                        </div>
                      )}
                      <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden bg-gray-900">
                        <img
                          className="w-full h-full object-cover object-center"
                          src={profileAvatar}
                          alt="avatar"
                        />
                      </div>
                    </div>

                    <div className="w-2/3 h-52 md:h-60 lg:h-72 p-2 xl:h-80 items-center justify-center hidden md:flex bg-gray-800 rounded-lg shadow-lg">
                      <Line className="" data={data} options={options} />
                    </div>
                  </div>

                  <div className="w-full py-6 px-4 flex mb-4 lg:flex-row justify-center items-center gap-4 bg-gray-800 md:gap-6 lg:gap-8 xl:gap-10 rounded-lg shadow-lg">
                    <div className="text-center w-full lg:w-auto">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-300 italic">
                        <span className="text-[#DAA520] font-bold not-italic">
                          Handle:
                        </span>{" "}
                        {profileHandle?.toLowerCase()}
                      </h2>
                    </div>
                    <div className="text-center w-full lg:w-auto">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-300">
                        <span className="text-[#DAA520] font-bold not-italic">
                          Rating:
                        </span>{" "}
                        {profileRating}
                      </h2>
                    </div>
                    <div className="text-center w-full lg:w-auto">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-300">
                        <span className="text-[#DAA520] font-bold not-italic">
                          Matches:
                        </span>{" "}
                        {totalMatches}
                      </h2>
                    </div>
                    <div className="text-center w-full lg:w-auto">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-300">
                        <span className="text-[#DAA520] font-bold not-italic">
                          Wins:
                        </span>{" "}
                        {wins}
                      </h2>
                    </div>
                    <div className="text-center w-full lg:w-auto">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-300">
                        <span className="text-[#DAA520] font-bold not-italic">
                          Draws:
                        </span>{" "}
                        {draws}
                      </h2>
                    </div>
                  </div>
                </div>
                {/* <div className="w-full border md:hidden flex items-center justify-center"> */}
                <div className="w-full h-52 md:h-60 lg:h-72 xl:h-80 items-center justify-center flex mx-auto md:hidden mb-4 p-2 bg-gray-800 rounded-lg shadow-lg">
                  <div className="w-full h-full">
                    <Line data={data} options={options} />
                  </div>
                </div>
                {/* </div> */}

                {/* <div className="w-40"></div> */}
              </div>
              <div className="flex flex-col items-center justify-center px-4">
                <div className="w-full px-4 py-4 bg-gray-800 rounded-lg shadow-lg">
                  <h1 className="text-2xl font-semibold text-blue-600">
                    MATCHES:{" "}
                  </h1>
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
                            className="border border-blue-300 bg-[#1c2532] py-2 flex flex-col md:flex-row justify-between rounded px-4 md:py-4 my-3 gap-4 cursor-pointer hover:border-blue-400 text-gray-200"
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
              {/* </div> */}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PlayerProfile;
