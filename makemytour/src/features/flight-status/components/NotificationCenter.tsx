import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Plane,
  X,
  Clock,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  setNotificationsEnabled,
} from "../store/flightTrackerSlice";
import { FlightNotification } from "../types/flightStatus.types";

export const NotificationCenter = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state: any) => state.flightTracker?.notifications || []
  ) as FlightNotification[];
  const notificationsEnabled = useSelector(
    (state: any) => state.flightTracker?.notificationsEnabled ?? true
  ) as boolean;

  const [browserPermission, setBrowserPermission] = useState<string>("default");
  const [activeToast, setActiveToast] = useState<FlightNotification | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Show floating toast whenever a new unread notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (!latest.read) {
        setActiveToast(latest);
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 6500);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === "granted") {
          dispatch(setNotificationsEnabled(true));
        }
      } catch (err) {
        console.error("Failed to request notification permission:", err);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Floating In-App Push Toast */}
      {activeToast && (
        <div className="fixed top-20 right-5 z-50 max-w-md w-full sm:w-96 bg-white rounded-xl shadow-2xl border-2 border-red-500/20 p-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-red-100 text-red-600 rounded-lg">
                <Plane className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Live Flight Update
                </p>
                <h4 className="text-sm font-extrabold text-gray-900">
                  {activeToast.airline}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-800 flex items-center justify-between">
              <span>{activeToast.route}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                {activeToast.statusDisplay}
              </span>
            </p>

            {activeToast.delayReason && (
              <p className="text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{activeToast.delayReason}</span>
              </p>
            )}

            {activeToast.estimatedArrival && (
              <p className="text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Revised ETA: {formatTime(activeToast.estimatedArrival)}</span>
              </p>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Just now</span>
            <button
              onClick={() => {
                dispatch(markNotificationRead(activeToast.id));
                setActiveToast(null);
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Bell Dropdown & Permission Control */}
      <div className="flex items-center space-x-2">
        {/* Browser Alert Toggle / Status */}
        {browserPermission === "default" && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestBrowserPermission}
            className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hidden sm:flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Enable Push Alerts</span>
          </Button>
        )}

        {browserPermission === "granted" && (
          <button
            onClick={() => dispatch(setNotificationsEnabled(!notificationsEnabled))}
            title={notificationsEnabled ? "Browser Alerts Active (Click to mute)" : "Browser Alerts Muted"}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              notificationsEnabled
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {notificationsEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden md:inline font-medium text-[11px]">Alerts ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden md:inline font-medium text-[11px]">Muted</span>
              </>
            )}
          </button>
        )}

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="relative p-2 h-9 w-9 rounded-full border-gray-200 hover:border-gray-300"
            >
              <Bell className="w-4 h-4 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-xl rounded-xl">
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Flight Alerts</h4>
                <p className="text-xs text-gray-500">
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="text-[11px] text-blue-600 hover:underline px-2 py-1"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => dispatch(clearAllNotifications())}
                    className="text-[11px] text-gray-400 hover:text-red-600 px-2 py-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-gray-400">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-medium">No live flight alerts yet.</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Changes in flight schedules will appear here in real time.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => dispatch(markNotificationRead(n.id))}
                    className={`p-3 text-xs transition-colors cursor-pointer hover:bg-gray-50 ${
                      !n.read ? "bg-red-50/50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 truncate">
                        {n.airline}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{n.route}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                        {n.statusDisplay}
                      </span>
                      {n.delayReason && (
                        <span className="text-[10px] text-red-600 font-medium">
                          • {n.delayReason}
                        </span>
                      )}
                    </div>
                    {n.estimatedArrival && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Est. Arrival: {formatTime(n.estimatedArrival)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default NotificationCenter;

