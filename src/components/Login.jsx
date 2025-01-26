import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, CenterSpinner, Input, Heading } from "./index.js";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login as loginPlayer } from "../store/features/authSlice.js";
import { Link } from "react-router-dom";
import chessImage from "../assets/chessmasterHomeImage.jpg";
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const login = async (data) => {
    console.log(data);
    const res = await dispatch(loginPlayer(data));
    reset();
    if (res?.payload?.data) {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen w-screen">
      <section className="lg:flex lg:flex-row lg:min-h-screen lg:w-4/5 min-h-[50vh] w-full p-0 items-center justify-center hidden">
        <img
          className="w-full h-[50vh] lg:h-full object-cover shadow-2xl object-center"
          src={chessImage}
        />
      </section>
      <section className="w-full min-h-screen flex flex-col px-6 items-center justify-between">
        <Heading />
        {loading && <CenterSpinner />}
        <div className="flex justify-center items-center h-full mx-auto w-full px-4 pt-2 text-white">
          <div className="p-4 pb-3 border-[2px] border-slate-500 rounded-lg shadow-md text-white max-w-2xl w-full">
            <div className="flex items-center justify-center">
              <h2 className="text-2xl font-bold mb-3 text-center font-sans">
                Login
              </h2>
            </div>
            <form onSubmit={handleSubmit(login)}>
              <div className="mb-3">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-white mb-1"
                >
                  Email or Handle
                </label>
                <Input
                  {...register("emailOrHandle", { required: true })}
                  type="text"
                  autoFocus
                  placeholder="email or handle"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring"
                />
                {errors.emailOrHandle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.emailOrHandle.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-white mb-1"
                >
                  Password
                </label>
                <Input
                  {...register("password", { required: true })}
                  id="password"
                  type="password"
                  placeholder="password"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <p className="text-gray-200">
                  Don't have an account?{" "}
                  <Link
                    to={"/register"}
                    className="text-gray-300 underline hover:text-gray-400 transition duration-200"
                  >
                    Create One
                  </Link>{" "}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                text={"Login"}
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

export default Login;
