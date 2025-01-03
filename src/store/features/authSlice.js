import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";

export const register = createAsyncThunk(
  "register",
  async (userData, { rejectWithValue }) => {
    let avatarURL;

    let data = {};
    console.log("userData.avatar[0] : ", userData.avatar[0]);

    if (userData.avatar[0]) {
      const avatarAndPresetName = new FormData();
      avatarAndPresetName.append("file", userData.avatar[0]);
      avatarAndPresetName.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_PRESET_NAME
      );

      data = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        avatarAndPresetName
      );
    }

    data.handle = userData.handle;
    data.email = userData.email;
    data.password = userData.password;
    data.avatar = data.secure_url;

    try {
      const res = await axiosInstance.post("/players/register", data);
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

const initialState = {
  loginStatus: false,
  userData: {},
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
        state.loading = false;
        state.loginStatus = true;
        state.userData = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        console.log("login reject action.error", action.error);
        state.loading = false;
      });
  },
});

export default authSlice.reducer;
