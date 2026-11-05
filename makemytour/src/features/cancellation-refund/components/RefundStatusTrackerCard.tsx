import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Building,
  Plane,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { CancellationRefundTracker, RefundStatus } from "../types/cancellation.types";
import { getBookingCancellation } from "../api/cancellationApi";

interface RefundStatusTrackerCardProps {
  bookingId: number | string;
  initialTracker?: CancellationRefundTracker | null;
  onTrackerUpdated?: (tracker: CancellationRefundTracker) => void;
}

export default function RefundStatusTrackerCard({
  bookingId,
  initialTracker,
  onTrackerUpdated,
}: RefundStatusTrackerCardProps) {
  const [tracker, setTracker] = useState<CancellationRefundTracker | null>(
    initialTracker || null
  );
  const [loading, setLoading] = useState(false);

  const fetchTracker = async () => {
    if (!bookingId || bookingId === "N/A") return;
    try {
      const data = await getBookingCancellation(Number(bookingId));
      if (data) {
        setTracker((prev) => {
          if (prev && prev.refundStatus !== data.refundStatus) {
            onTrackerUpdated?.(data);
          }
          return data;
        });
      }
    } catch (err) {
      // Silently catch in polling loop
    }
  };

  useEffect(() => {
    if (!initialTracker) {
      fetchTracker();
    }
    // Poll every 15 seconds to reflect live admin mutations
    const interval = setInterval(fetchTracker, 15000);
    return () => clearInterval(interval);
  }, [bookingId]);

  if (!tracker) {
    return null;
  }

  // Determine stage progression:
  // 1: PENDING (Initiated)
  // 2: PROCESSED (Approved / Processed by Airline/Hotel)
  // 3: COMPLETED (Credited to original source)
  const getStepState = () => {
    const status = tracker.refundStatus;
    if (status === "COMPLETED") return { step1: true, step2: true, step3: true };
    if (status === "PROCESSED") return { step1: true, step2: true, step3: false };
    if (status === "PENDING") return { step1: true, step2: false, step3: false };
    return { step1: false, step2: false, step3: false };
  };

  const steps = getStepState();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mt-3 p-4 bg-gradient-to-r from-red-50/50 via-gray-50 to-emerald-50/30 border border-red-100 rounded-xl space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-900 block">
              Live Refund Tracker
            </span>
            <span className="text-[11px] text-gray-500">
              Reason: <strong className="text-gray-700">{tracker.reasonLabel}</strong>
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase font-semibold text-gray-400 block">
            Refund Amount
          </span>
          <span className="text-sm font-extrabold text-emerald-600 font-mono">
            ₹{tracker.refundAmount?.toLocaleString() || 0}
            <span className="text-[11px] font-normal text-gray-500 ml-1">
              ({tracker.refundPercentage}% policy)
            </span>
          </span>
        </div>
      </div>

      {/* 3-Step Horizontal Stepper */}
      <div className="relative pt-2 pb-1">
        {/* Connecting Progress Bar */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full -translate-y-1/2 z-0">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{
              width: steps.step3 ? "100%" : steps.step2 ? "50%" : "0%",
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 grid grid-cols-3 text-center">
          {/* Step 1: Initiated */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                steps.step1
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-50"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-900 mt-2">Refund Initiated</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              {formatDate(tracker.cancelledAt) || "Instant"}
            </p>
          </div>

          {/* Step 2: Under Review / Processed */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                steps.step2
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-50"
                  : "bg-amber-100 text-amber-700 ring-4 ring-amber-50 animate-pulse"
              }`}
            >
              {steps.step2 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <p className="text-xs font-bold text-gray-900 mt-2">
              {steps.step2 ? "Processed by Provider" : "In Review"}
            </p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              {steps.step2 && tracker.processedAt
                ? formatDate(tracker.processedAt)
                : "24–48 hrs standard"}
            </p>
          </div>

          {/* Step 3: Completed */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                steps.step3
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-50"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-900 mt-2">
              {steps.step3 ? "Refund Credited" : "Credited to Bank"}
            </p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              {steps.step3 && tracker.completedAt
                ? formatDate(tracker.completedAt)
                : `Expected by ${formatShortDate(tracker.expectedCompletionAt)}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

