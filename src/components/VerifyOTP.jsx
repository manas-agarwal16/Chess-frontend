import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { login, resendOTP, verifyOTP } from "../store/features/authSlice";
import { useForm } from "react-hook-form";
import { Button, Input, CenterSpinner } from "./index";
import toast from "react-hot-toast";

const VerifyOTP = () => {
  const { loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, reset } = useForm();
  const { email } = useParams();
  console.log("email : ", email);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleResendOTP = () => {
    console.log("here");
    
    dispatch(resendOTP({ email }));
  };

  const verify = async (data) => {
    console.log("data : ", data);
    const res = await dispatch(verifyOTP({ email, otp: data.OTP }));
    console.log("verify OTP after enter : ", res);

    if (res?.payload?.success === true) {
      dispatch(
        login({
          emailOrHandle: res.payload.data.email,
          password: res.payload.data.password,
        })
      );  
      navigate("/");
    } else {
      reset();
      dispatch(resendOTP({ email }));
    }
  };

  return (
    <div className="flex min-h-screen w-screen">
      <section className="min-h-screen w-full p-3 flex-col items-center justify-center">
        <img
          className="w-full h-full rounded-lg shadow-lg"
          src="https://cdn.pixabay.com/photo/2024/02/17/17/20/chess-8579843_1280.jpg"
          alt="chess-image"
        />
      </section>
      <section className="w-full min-h-screen flex flex-col px-6 items-center justify-between">
        <h1 className="text-5xl font-bold pt-4 text-[#BC8F8F]">Chess Master</h1>
        {loading && <CenterSpinner width={40} />}
        <div className="flex justify-center items-center h-full mx-auto w-full px-4 pt-2 text-white">
          <div className="p-4 pb-3 border-[2px] rounded-lg shadow-md text-white max-w-2xl w-full">
            <div className="flex items-center justify-center">
              <h2 className="text-2xl font-bold mb-3 text-center font-sans">
                Verify OTP
              </h2>
            </div>
            <form onSubmit={handleSubmit(verify)}>
              <div className="mb-3">
                <label
                  htmlFor="otp"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Enter the OTP sent to the email <span className="text-gray-700">{email}</span>
                </label>
                <Input
                  {...register("OTP", { required: true })}
                  type="text"
                  id="otp"
                  placeholder="Enter OTP"
                  maxLength="6"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
                />
              </div>

              <div className="mb-5">
                <p className="text-white">
                  <button
                    className="text-gray-700 underline hover:text-gray-800"
                    onClick={handleResendOTP}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                text={"Verify OTP"}
                bgColor="focus:outline-none focus:ring-2"
                className="w-full py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 px-6 text-sm"
              />
            </form>
          </div>
        </div>
        {/* <div></div> */}
      </section>
    </div>
  );
};

export default VerifyOTP;
