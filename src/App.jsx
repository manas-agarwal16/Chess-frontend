import { useEffect, useState } from "react";
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCurrentPlayer , refreshAccessToken } from "./store/features/authSlice.js";

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    <div className="bg-gray-800 min-h-screen selection:bg-[#a45633]">
      <Outlet />
    </div>
  );
};

export default App;
