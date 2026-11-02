import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Check, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackFlight, untrackFlight } from "../store/flightTrackerSlice";

interface TrackFlightButtonProps {
  flightId: number;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export const TrackFlightButton: React.FC<TrackFlightButtonProps> = ({
  flightId,
  variant = "outline",
  size = "sm",
  className = "",
  showText = true,
}) => {
  const dispatch = useDispatch();
  const trackedFlightIds = useSelector(
    (state: any) => state.flightTracker?.trackedFlightIds || []
  ) as number[];

  const isTracked = trackedFlightIds.includes(Number(flightId));

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isTracked) {
      dispatch(untrackFlight(Number(flightId)));
    } else {
      dispatch(trackFlight(Number(flightId)));
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleToggle}
      className={`transition-all duration-150 font-medium ${
        isTracked
          ? "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
          : "border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50/50"
      } ${className}`}
      title={isTracked ? "Click to untrack flight" : "Track flight live status"}
    >
      {isTracked ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          {showText && <span>Tracking</span>}
        </>
      ) : (
        <>
          <Radio className="w-3.5 h-3.5 mr-1 text-red-500 animate-pulse" />
          {showText && <span>Track Live</span>}
        </>
      )}
    </Button>
  );
};

export default TrackFlightButton;

