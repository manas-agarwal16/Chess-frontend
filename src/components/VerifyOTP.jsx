import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { login, resendOTP, verifyOTP } from "../store/features/authSlice";
import { useForm } from "react-hook-form";
import { Button, Input, CenterSpinner, Heading } from "./index";
import chessImage from "../assets/chessmasterHomeImage.jpg";

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
    }
  };

  return (
    <div className="flex min-h-screen w-screen">
      <section className="lg:flex lg:flex-row lg:min-h-screen lg:w-screen min-h-[50vh] w-full p-0 items-center justify-center hidden">
        <img
          className="w-full h-[50vh] lg:h-full object-cover shadow-2xl object-center"
          src={chessImage}
        />
      </section>
      <section className="w-full min-h-screen flex flex-col px-6 items-center justify-between">
        <Heading />
        {loading && <CenterSpinner />}
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
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  Enter the OTP sent to the email:{" "}
                  <span className="text-gray-100 underline tracking-wide">
                    {email}
                  </span>
                </label>
                <Input
                  {...register("OTP", { required: true })}
                  type="text"
                  id="otp"
                  placeholder="Enter OTP"
                  maxLength="6"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                />
              </div>

              <div className="mb-5">
                <p className="text-white">
                  <div
                    className="text-gray-300 cursor-pointer underline hover:text-gray-400"
                    onClick={handleResendOTP}
                  >
                    Resend OTP
                  </div>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                text={"Verify OTP"}
                // bgColor="focus:outline-none focus:ring-2"
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
