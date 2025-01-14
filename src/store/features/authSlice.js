import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axiosInstance.js";
import axios from "axios";
import toast from "react-hot-toast";
import { data } from "react-router-dom";

export const getCurrentPlayer = createAsyncThunk(
  "curPlayer",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/players/get-current-player");
      return response.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to get current player"
      );
    }
  }
);

export const register = createAsyncThunk(
  "register",
  async (userData, { rejectWithValue }) => {
    let avatarURL;

    let data = {};
    console.log("userData.avatar[0] : ", userData.avatar[0]);

    if (userData.avatar[0]) {
      console.log("in here sir");

      const avatarAndPresetName = new FormData();
      avatarAndPresetName.append("file", userData.avatar[0]);
      avatarAndPresetName.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_PRESET_NAME
      );

      try {
        data = await axios.post(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          avatarAndPresetName
        );
      } catch (error) {
        console.log("error deploying avatar to cloudinary: ", error);
      }
      console.log(
        "data after deploying avatar to cloudinary: ",
        data?.data?.secure_url
      );
    }

    const userDataForBackend = {
      handle: userData.handle,
      email: userData.email,
      password: userData.password,
      avatarURL: data?.data?.secure_url,
    };

    try {
      const res = await axiosInstance.post(
        "/players/register",
        userDataForBackend
      );
      console.log("Register backend response:", res.data);
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
      throw error;
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "verifyOTP",
  async (data, { rejectWithValue }) => {
    try {
      console.log("verify data: ", data);
      const response = await axiosInstance.post("/players/verify-otp", data);
      return response?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP failed");
    }
  }
);

export const resendOTP = createAsyncThunk(
  "resendOTP",
  async (data, { rejectWithValue }) => {
    try {
      console.log("data: ", data);
      const response = await axiosInstance.get(
        `/players/resend-otp/${data.email}`
      );
      toast.success(response.data.message, {
        autoClose: 3000,
      });
      return response.data;
    } catch (error) {
      toast.error(error?.response.data.message || "Resend OTP failed");
    }
  }
);

export const login = createAsyncThunk(
  "login",
  async (data, { rejectWithValue }) => {
    try {
      console.log("login data: ", data);
      const response = await axiosInstance.post("/players/login", data);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "logout",
  async (data, { rejectWithValue }) => {
    try {
      console.log("logout authslice");

      const response = await axiosInstance.get("/players/logout");
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  }
);

export const fetchPlayerRating = createAsyncThunk(
  "fetchPlayerData",
  async (id, { rejectWithValue }) => {
    try {
      console.log("fetch player rating");
      const res = await axiosInstance.get(`/players/fetch-player-rating/${id}`);
      console.log("res.data", res.data);
      return res.data;
    } catch (error) {
      console.log("error in fetchPlayerRating", error);
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  "refreshAccessToken",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/players/refresh-access-token");
      return response.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to refresh access token"
      );
    }
  }
);

const initialState = {
  loginStatus: null,
  playerData: {},
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPlayerRating.pending, (state, action) => {
      // state.loading = true;
    })
    builder.addCase(fetchPlayerRating.fulfilled, (state, action) => {
      console.log("fetchPlayerRating action.payload", action.payload);
      // state.loading = false;
      state.playerData.rating = action.payload.data;
    });
    builder.addCase(fetchPlayerRating.rejected, (state, action) => {
      console.log("fetchPlayerRating action.error", action.error);
      // state.loading = false;
    });

    builder
      .addCase(getCurrentPlayer.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCurrentPlayer.fulfilled, (state, action) => {
        console.log(
          "getCurrentPlayer action.payload.data",
          action.payload?.data
        );

        state.loading = false;
        if (action.payload?.data?.playerData) {
          state.playerData = action.payload?.data?.playerData;
        } else {
          state.playerData = {};
        }
        if (action.payload?.data?.loginStatus) {
          state.loginStatus = action.payload?.data?.loginStatus;
        } else {
          state.loginStatus = false;
        }
      })
      .addCase(getCurrentPlayer.rejected, (state, action) => {
        console.log("getCurrentPlayer action.error", action.error);
        state.loading = false;
      });

    builder
      .addCase(register.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        console.log("action.payload", action.payload);

        state.loading = false;
      });
    builder
      .addCase(verifyOTP.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        console.log("in rejected action.error", action.error);

        state.loading = false;
      });

    builder
      .addCase(resendOTP.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(login.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("action.payload", action.payload);
        if (action.payload === undefined) {
          state.loading = false;
        } else {
          state.loading = false;
          state.loginStatus = true;
          state.playerData = action.payload.data.playerData;
        }
      })
      .addCase(login.rejected, (state, action) => {
        console.log("login reject action.error", action.error);
        state.loading = false;
      });
    builder
      .addCase(logout.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.loginStatus = false;
        state.playerData = {};
      })
      .addCase(logout.rejected, (state, action) => {
        console.log("logout reject action.error", action.error);
        state.loading = false;
      });
  },
});

export default authSlice.reducer;
