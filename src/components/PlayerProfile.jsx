import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../utils/axiosInstance";
import CenterSpinner from "./CenterSpinner";
import { Spinner } from "./index.js";
import Heading from "./Heading";
import { Link } from "react-router-dom";

const PlayerProfile = () => {
  const { handle } = useParams();
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [profileHandle, setProfileHandle] = useState(null);
  const [profileEmail, setProfileEmail] = useState(null);
  const [profileRating, setProfileRating] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        let res = await axiosInstance.get(
          `/players/profile/${handle}?page=${page}`
        );
        res = res?.data?.data;
        console.log("res.matches: ", res?.matches);

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

  const handleClickMore = () => {
    setMatchLoading(() => true);
    setPage((prev) => prev + 1);
  };

  return (
    <>
      {profileLoading && (
        <div className="flex justify-center items-center col-span-full">
          <CenterSpinner width={10} />
        </div>
      )}
      {profileNotFound && (
        <div className="min-h-screen min-w-screen flex justify-center items-center text-2xl text-white font-semibold">
          No player found with this handle.{" "}
        </div>
      )}
      <div>
        {!profileNotFound && (
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
              <h1 className="text-2xl text-gray-200">Matches: </h1>
              <ul className="text-white">
                {matches?.map((match) => {
                  return (
                    <li
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
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlayerProfile;
