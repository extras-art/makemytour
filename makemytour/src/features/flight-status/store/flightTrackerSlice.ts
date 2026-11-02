import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FlightNotification,
  FlightStatusUpdate,
  FlightTrackerState,
} from "../types/flightStatus.types";

const STORAGE_KEY = "makemytour_tracked_flights";
const NOTIFICATION_PERM_KEY = "makemytour_flight_notif_enabled";

const getInitialTrackedIds = (): number[] => {
  if (typeof window === "undefined") {
    return [1, 2, 3];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((id) => Number(id)).filter((id) => !isNaN(id));
      }
    }
  } catch {
    // fallback
  }
  return [1, 2, 3]; // default initial watchlist
};

const saveTrackedIdsToStorage = (ids: number[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }
};

const getInitialNotificationEnabled = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(NOTIFICATION_PERM_KEY);
    if (stored !== null) {
      return stored === "true";
    }
  } catch {
    // ignore
  }
  return true;
};

const initialState: FlightTrackerState = {
  trackedFlightIds: getInitialTrackedIds(),
  statuses: {},
  notifications: [],
  notificationsEnabled: getInitialNotificationEnabled(),
  loading: false,
  lastPolledAt: null,
  isFlightHomeActive: true,
};

export const flightTrackerSlice = createSlice({
  name: "flightTracker",
  initialState,
  reducers: {
    trackFlight: (state, action: PayloadAction<number>) => {
      const flightId = Number(action.payload);
      if (!state.trackedFlightIds.includes(flightId)) {
        state.trackedFlightIds.push(flightId);
        saveTrackedIdsToStorage(state.trackedFlightIds);
      }
    },
    untrackFlight: (state, action: PayloadAction<number>) => {
      const flightId = Number(action.payload);
      state.trackedFlightIds = state.trackedFlightIds.filter((id) => id !== flightId);
      delete state.statuses[flightId];
      saveTrackedIdsToStorage(state.trackedFlightIds);
    },
    updateFlightStatuses: (state, action: PayloadAction<FlightStatusUpdate[]>) => {
      action.payload.forEach((status) => {
        state.statuses[status.flightId] = status;
      });
      state.lastPolledAt = new Date().toISOString();
      state.loading = false;
    },
    updateSingleFlightStatus: (state, action: PayloadAction<FlightStatusUpdate>) => {
      const status = action.payload;
      state.statuses[status.flightId] = status;
      state.lastPolledAt = new Date().toISOString();
    },
    addNotification: (state, action: PayloadAction<FlightNotification>) => {
      // Keep last 30 notifications, unshifted
      state.notifications = [action.payload, ...state.notifications].slice(0, 30);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const target = state.notifications.find((n) => n.id === action.payload);
      if (target) {
        target.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(NOTIFICATION_PERM_KEY, String(action.payload));
        } catch {
          // ignore
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFlightHomeActive: (state, action: PayloadAction<boolean>) => {
      state.isFlightHomeActive = action.payload;
    },
    syncTrackedIdsFromStorage: (state) => {
      state.trackedFlightIds = getInitialTrackedIds();
    },
  },
});

export const {
  trackFlight,
  untrackFlight,
  updateFlightStatuses,
  updateSingleFlightStatus,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  setNotificationsEnabled,
  setLoading,
  setFlightHomeActive,
  syncTrackedIdsFromStorage,
} = flightTrackerSlice.actions;

export default flightTrackerSlice.reducer;

