import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Plane,
  Clock,
  MapPin,
  AlertTriangle,
  RotateCw,
  Trash2,
  CheckCircle,
  Building2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlightStatusUpdate, FlightStatusEnum } from "../types/flightStatus.types";
import {
  untrackFlight,
  updateSingleFlightStatus,
  addNotification,
} from "../store/flightTrackerSlice";
import { simulateFlightStatusChange } from "../api/flightStatusApi";

interface FlightStatusCardProps {
  status: FlightStatusUpdate;
  onUntrack?: (flightId: number) => void;
}

export const FlightStatusCard: React.FC<FlightStatusCardProps> = ({ status, onUntrack }) => {
  const dispatch = useDispatch();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateChange = async () => {
    try {
      setIsSimulating(true);
      const prev = { ...status };
      const updated = await simulateFlightStatusChange(status.flightId);
      dispatch(updateSingleFlightStatus(updated));

      // Trigger instant diff notification for demo feedback
      if (
        prev.status !== updated.status ||
        prev.delayMinutes !== updated.delayMinutes ||
        prev.estimatedArrival !== updated.estimatedArrival
      ) {
        dispatch(
          addNotification({
            id: `${updated.flightId}-${Date.now()}`,
            flightId: updated.flightId,
            airline: updated.airline,
            route: `${updated.source} → ${updated.destination}`,
            oldStatus: prev.status,
            newStatus: updated.status,
            statusDisplay: updated.statusDisplay,
            delayMinutes: updated.delayMinutes,
            delayReason: updated.delayReason,
            estimatedArrival: updated.estimatedArrival,
            timestamp: new Date().toISOString(),
            read: false,
          })
        );
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleUntrack = () => {
    if (onUntrack) {
      onUntrack(status.flightId);
    } else {
      dispatch(untrackFlight(status.flightId));
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const getStatusBadge = (s: FlightStatusEnum, delayMin: number) => {
    switch (s) {
      case "ON_TIME":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "On Time",
        };
      case "BOARDING":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500 animate-ping",
          label: status.statusDisplay || "Boarding",
        };
      case "IN_AIR":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-500",
          label: status.statusDisplay || "In Air",
        };
      case "DELAYED":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
          label: status.statusDisplay || `Delayed by ${delayMin}m`,
        };
      case "LANDED":
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-300",
          dot: "bg-gray-500",
          label: status.statusDisplay || "Landed",
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          dot: "bg-gray-400",
          label: "Scheduled",
        };
    }
  };

  const badge = getStatusBadge(status.status, status.delayMinutes);
  const isDelayed = status.status === "DELAYED" || status.delayMinutes > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                <Plane className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-gray-900 text-base tracking-tight">
                {status.airline}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {status.terminal}
              </span>
              <span>•</span>
              <span className="font-semibold text-gray-700">{status.gate}</span>
              {status.originalDeparture && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(status.originalDeparture)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              <span>{badge.label}</span>
            </span>

            <button
              onClick={handleUntrack}
              title="Remove from Watchlist"
              className="text-gray-300 hover:text-red-500 p-1 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delay Reason Banner */}
        {isDelayed && status.delayReason && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Delay Reason: </span>
              <span>{status.delayReason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Flight Path & Progress */}
      <div className="p-5 py-4 bg-gray-50/50">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Origin
            </p>
            <p className="text-lg font-black text-gray-900">{status.source}</p>
          </div>

          <div className="flex-1 px-6">
            <div className="relative flex items-center justify-center">
              {/* Progress Track */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${Math.min(Math.max(status.progressPercentage, 0), 100)}%` }}
                />
              </div>

              {/* Positioned Airplane */}
              <div
                className="absolute -top-2.5 transition-all duration-700 ease-out -translate-x-1/2"
                style={{
                  left: `${Math.min(Math.max(status.progressPercentage, 5), 95)}%`,
                }}
              >
                <div className="bg-red-600 text-white p-1 rounded-full shadow-md">
                  <Plane className="w-3 h-3 rotate-90" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
              <span>{status.progressPercentage}% Completed</span>
              <span className="font-medium text-gray-600">
                {status.status === "IN_AIR"
                  ? "Cruising"
                  : status.status === "BOARDING"
                  ? "Boarding Gate"
                  : status.status === "LANDED"
                  ? "Arrived"
                  : "Scheduled"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Destination
            </p>
            <p className="text-lg font-black text-gray-900">{status.destination}</p>
          </div>
        </div>

        {/* Schedule Grid: Original vs Revised */}
        <div className="mt-4 pt-3 border-t border-gray-200/60 grid grid-cols-2 gap-3 text-xs">
          {/* Departure */}
          <div className="p-2.5 bg-white rounded-xl border border-gray-100">
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Departure</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-sm font-bold ${
                  isDelayed && status.revisedDeparture !== status.originalDeparture
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {formatTime(status.originalDeparture)}
              </span>
              {isDelayed && status.revisedDeparture && (
                <span className="text-sm font-extrabold text-amber-700">
                  {formatTime(status.revisedDeparture)}
                </span>
              )}
            </div>
          </div>

          {/* Arrival / ETA */}
          <div className="p-2.5 bg-white rounded-xl border border-gray-100">
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Estimated Arrival</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-sm font-bold ${
                  isDelayed && status.estimatedArrival !== status.originalArrival
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {formatTime(status.originalArrival)}
              </span>
              {isDelayed && status.estimatedArrival && (
                <span className="text-sm font-extrabold text-amber-700">
                  {formatTime(status.estimatedArrival)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Updated just now</span>
        </span>

        {/* Demo / Live Simulator Trigger */}
        <Button
          size="sm"
          variant="outline"
          disabled={isSimulating}
          onClick={handleSimulateChange}
          className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 font-semibold flex items-center gap-1.5"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin text-red-600" : ""}`} />
          <span>{isSimulating ? "Simulating..." : "Simulate Live Update"}</span>
        </Button>
      </div>
    </div>
  );
};

export default FlightStatusCard;

