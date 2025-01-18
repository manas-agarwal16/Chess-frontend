import React from "react";
import { Button, Input, CenterSpinner, Heading } from "./index";
import { useForm } from "react-hook-form";
import { register as registerPlayer } from "../store/features/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import chessImage from "../assets/chessmasterHomeImage.jpg";

const Register = () => {
  const { loading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRegister = async (data) => {
    console.log("register data : ", data);
    const res = await dispatch(registerPlayer(data));
    console.log("res : ", res);

    if (res?.payload === true) {
      navigate(`/verify-otp/${data.email}`);
    }
  };

  const validateAvatar = (avatar) => {
    console.log("avatar : ", avatar);

    if (avatar[0]) {
      if (avatar[0].size > 1048576) {
        return "File size must be less than 1MB";
      }
      if (!avatar[0].type.includes("image")) {
        return "File must be an image";
      }
    }
    return true;
  };

  return (
    <div className="flex min-h-screen w-screen">
      <section className="lg:flex lg:flex-row lg:min-h-screen lg:w-4/5 min-h-[50vh] w-full p-0 items-center justify-center hidden">
        <img
          className="filter brightness-75 w-full h-[50vh] lg:h-full object-cover shadow-2xl object-center"
          src={chessImage}
          alt="chess-image"
        />
      </section>
      <section className="w-full min-h-screen flex flex-col px-6 items-center justify-between">
        <Heading />
        {loading && <CenterSpinner width={10} />}
        <div className="flex justify-center items-center h-full mx-auto w-full px-4 pt-2 text-white">
          <div className="p-4 pb-3 border-[2px] border-slate-500 rounded-lg shadow-md text-white max-w-2xl w-full">
            <div className="flex items-center justify-center">
              <h2 className="text-2xl font-bold mb-3 text-center font-sans">
                Register
              </h2>
            </div>
            <form onSubmit={handleSubmit(handleRegister)}>
              {/* Full Name */}
              <div className="mb-3">
                <label
                  htmlFor="full-name"
                  className="block text-sm font-semibold text-white mb-1"
                >
                  Handle
                </label>
                <Input
                  {...register("handle", {
                    required: "Handle is required.",
                  })}
                  autoFocus
                  type="text"
                  id="handle"
                  placeholder="Enter your name"
                  className="w-full p-2 py-2 rounded-md focus:outline-none focus:ring"
                />
                {errors.handle && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.handle.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-white mb-1"
                >
                  Email
                </label>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-white mb-1"
                >
                  Password
                </label>
                <Input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Avatar */}
              <div className="mb-3">
                <label
                  htmlFor="avatar"
                  className="block text-sm font-semibold text-white mb-1"
                >
                  Avatar (Optional)
                </label>
                <Input
                  {...register("avatar", {
                    validate: validateAvatar,
                  })}
                  type="file"
                  id="avatar"
                  accept="image/*"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                />
                {errors.avatar && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.avatar.message}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <p className="text-gray-200">
                  Have an account?{" "}
                  <Link
                    to={"/login"}
                    className="text-gray-300 text-sm underline hover:text-gray-400 transition duration-200"
                  >
                    Login
                  </Link>{" "}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                text={"Register"}
                className="w-full py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 px-6 text-sm"
              />
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
