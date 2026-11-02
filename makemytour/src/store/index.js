import { configureStore, createSlice } from "@reduxjs/toolkit";
import flightTrackerReducer from "@/features/flight-status/store/flightTrackerSlice";


const saveusertolocalstorage = (user) => {
  if (typeof window !== "undefined" && localStorage) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};
const initialState = {
  user: null,
  isAuthLoaded: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthLoaded = true;
      saveusertolocalstorage(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthLoaded = true;
      if (typeof window !== "undefined" && localStorage) {
        localStorage.removeItem("user");
      }
    },
    setAuthLoaded: (state) => {
      state.isAuthLoaded = true;
    },
  },
});

export const { setUser, clearUser, setAuthLoaded } = userSlice.actions;

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    flightTracker: flightTrackerReducer,
  },
});

export default store;
