import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBatchFlightStatus } from "../api/flightStatusApi";
import {
  updateFlightStatuses,
  addNotification,
  setLoading,
  pruneInactiveFlights,
} from "../store/flightTrackerSlice";
import { FlightNotification, FlightStatusUpdate } from "../types/flightStatus.types";

interface UseFlightStatusPollerOptions {
  intervalMs?: number;
  enabled?: boolean;
}

export const useFlightStatusPoller = ({
  intervalMs = 15000,
  enabled = true,
}: UseFlightStatusPollerOptions = {}) => {
  const dispatch = useDispatch();
  const trackedFlightIds = useSelector(
    (state: any) => state.flightTracker?.trackedFlightIds || []
  ) as number[];
  const statuses = useSelector(
    (state: any) => state.flightTracker?.statuses || {}
  ) as Record<number, FlightStatusUpdate>;
  const notificationsEnabled = useSelector(
    (state: any) => state.flightTracker?.notificationsEnabled ?? true
  ) as boolean;

  // Ref to hold current statuses for diffing without recreating poll callback
  const prevStatusesRef = useRef<Record<number, FlightStatusUpdate>>({});
  const isInitialFetchRef = useRef<boolean>(true);

  // Keep prevStatusesRef in sync with Redux statuses
  useEffect(() => {
    prevStatusesRef.current = statuses;
  }, [statuses]);

  /**
   * Fire browser push notification via Web Notification API if permitted.
   */
  const triggerBrowserNotification = useCallback(
    (notif: FlightNotification) => {
      if (!notificationsEnabled) return;

      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            const body = `${notif.airline} (${notif.route}): ${notif.statusDisplay}${
              notif.delayReason ? ` • ${notif.delayReason}` : ""
            }${notif.estimatedArrival ? ` • ETA: ${new Date(notif.estimatedArrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`;

            new Notification(`Flight Alert: ${notif.airline}`, {
              body,
              icon: "/favicon.ico",
              tag: `flight-${notif.flightId}-${Date.now()}`,
            });
          } catch (e) {
            console.warn("Browser Notification API failed:", e);
          }
        }
      }
    },
    [notificationsEnabled]
  );

  /**
   * Poll tracked flights and detect state diffs.
   */
  const pollStatuses = useCallback(
    async (isManual: boolean = false) => {
      if (!trackedFlightIds || trackedFlightIds.length === 0) {
        return;
      }

      if (isManual || isInitialFetchRef.current) {
        dispatch(setLoading(true));
      }

      try {
        const freshStatuses = await fetchBatchFlightStatus(trackedFlightIds);
        const prevMap = prevStatusesRef.current;

        // Gracefully prune any tracked flight IDs that are no longer active in the backend catalog
        const returnedIds = freshStatuses.map((s) => s.flightId);
        if (returnedIds.length < trackedFlightIds.length) {
          dispatch(pruneInactiveFlights(returnedIds));
        }

        // Perform diff detection only after initial fetch
        if (!isInitialFetchRef.current) {
          for (const incoming of freshStatuses) {
            const prev = prevMap[incoming.flightId];

            if (prev) {
              const statusChanged = prev.status !== incoming.status;
              const delayChanged = prev.delayMinutes !== incoming.delayMinutes;

              // Ensure notifications only fire on genuine operational status/delay transitions,
              // not when the daily catalog refresh shifts baseline schedule for an on-time flight
              if (statusChanged || delayChanged) {
                const notif: FlightNotification = {
                  id: `${incoming.flightId}-${Date.now()}`,
                  flightId: incoming.flightId,
                  airline: incoming.airline,
                  route: `${incoming.source} → ${incoming.destination}`,
                  oldStatus: prev.status,
                  newStatus: incoming.status,
                  statusDisplay: incoming.statusDisplay,
                  delayMinutes: incoming.delayMinutes,
                  delayReason: incoming.delayReason,
                  estimatedArrival: incoming.estimatedArrival,
                  timestamp: new Date().toISOString(),
                  read: false,
                };

                dispatch(addNotification(notif));
                triggerBrowserNotification(notif);
              }
            }
          }
        }

        dispatch(updateFlightStatuses(freshStatuses));
        isInitialFetchRef.current = false;
      } catch (error) {
        console.error("Failed to poll flight statuses:", error);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [trackedFlightIds, dispatch, triggerBrowserNotification]
  );

  // Interval polling
  useEffect(() => {
    if (!enabled || trackedFlightIds.length === 0) return;

    // Initial immediate fetch
    pollStatuses();

    const timer = setInterval(() => {
      pollStatuses();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, intervalMs, trackedFlightIds, pollStatuses]);

  return {
    refetch: () => pollStatuses(true),
  };
};

