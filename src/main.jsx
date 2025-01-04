import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { io } from "socket.io-client";
import { Provider } from "react-redux";
import { Home, Login, Register , VerifyOTP } from "./pages/index.js";
import store from "./store/store.js";
import { Toaster } from "react-hot-toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: 'verify-otp/:email',
        element: <VerifyOTP />,
      }
    ],
  },
]);

export const socket = io(import.meta.env.VITE_SERVER_URL);
console.log("socket", socket); 

socket.on("connect", () => {
  console.log("connected");
});

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
    {/* Add the Toaster here */}
    <Toaster
      position="top-right"
      reverseOrder={true}
      toastOptions={{
        error: {
          style: {
            borderRadius: "4px",
            backgroundColor: "#2c2c2c", // Dark background
            color: "#ff6b6b", // Professional error red
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)", // Subtle shadow
          },
        },
        success: {
          style: {
            borderRadius: "4px",
            backgroundColor: "#2c2c2c", // Dark background
            color: "#4caf50", // Professional success green
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)", // Subtle shadow
          },
        },
        duration: 1500, // Slightly longer duration for better visibility
      }}
    />
  </Provider>
);
