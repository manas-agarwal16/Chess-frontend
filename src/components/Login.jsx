import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, CenterSpinner, Input } from "./index.js";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../store/features/authSlice.js";
import { Link } from "react-router-dom";
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
    const res = await dispatch(login(data));
    reset();
    if (res?.payload?.data) {
      navigate("/");
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
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
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
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <p className="text-white">
                  Don't have an account?{" "}
                  <Link
                    to={"/register"}
                    className="text-gray-700 underline hover:text-gray-800 transition duration-200"
                  >
                    Create One
                  </Link>{" "}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                text={"Login"}
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

export default Login;
