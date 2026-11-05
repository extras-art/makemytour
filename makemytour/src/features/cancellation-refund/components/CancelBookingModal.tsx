import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import {
  CANCELLATION_REASONS,
  type CancellationReason,
  type RefundQuote,
  type CancellationRefundTracker,
} from "../types/cancellation.types";
import { getRefundQuote, cancelBooking } from "../api/cancellationApi";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: number | string;
    title: string;
    type: "Flight" | "Hotel" | "Booking";
    quantity: number;
    formattedPrice?: string;
    totalPrice?: number;
  } | null;
  onSuccess: (result: CancellationRefundTracker) => void;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: CancelBookingModalProps) {
  const [quantityToCancel, setQuantityToCancel] = useState<number>(1);
  const [reason, setReason] = useState<CancellationReason>("CHANGE_OF_PLANS");
  const [notes, setNotes] = useState<string>("");
  const [quote, setQuote] = useState<RefundQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuantity = booking?.quantity || 1;

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen && booking) {
      setQuantityToCancel(booking.quantity || 1);
      setReason("CHANGE_OF_PLANS");
      setNotes("");
      setError(null);
    }
  }, [isOpen, booking]);

  // Fetch live refund quote whenever quantity or reason changes
  useEffect(() => {
    if (!isOpen || !booking || !booking.id || booking.id === "N/A") return;

    let isMounted = true;
    const fetchQuote = async () => {
      setLoadingQuote(true);
      setError(null);
      try {
        const q = await getRefundQuote(
          Number(booking.id),
          quantityToCancel,
          reason
        );
        if (isMounted) {
          setQuote(q);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to calculate refund quote");
        }
      } finally {
        if (isMounted) {
          setLoadingQuote(false);
        }
      }
    };

    const timer = setTimeout(fetchQuote, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, booking?.id, quantityToCancel, reason]);

  const handleConfirmCancel = async () => {
    if (!booking?.id) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await cancelBooking({
        bookingId: Number(booking.id),
        quantityToCancel,
        reason,
        additionalNotes: notes.trim() || undefined,
      });
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process cancellation");
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-white text-gray-900 border border-gray-200 shadow-2xl p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-red-600">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">
                Cancel Booking #{booking.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {booking.title} · {booking.type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 my-2">
          {/* Step 1: Quantity Selection (if > 1) */}
          {totalQuantity > 1 && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                <span>Quantity to Cancel</span>
                <span className="text-red-600 font-bold">
                  {quantityToCancel} of {totalQuantity} {booking.type === "Flight" ? "Seat(s)" : "Room(s)"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max={totalQuantity}
                  value={quantityToCancel}
                  onChange={(e) => setQuantityToCancel(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex gap-1">
                  {Array.from({ length: totalQuantity }, (_, i) => i + 1).map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantityToCancel(qty)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
                        quantityToCancel === qty
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Reason Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-gray-600 tracking-wider">
              Reason for Cancellation
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as CancellationReason)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
              >
                {CANCELLATION_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-gray-600 tracking-wider">
              Additional Details (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide any specific notes for refund processing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition resize-none"
            />
          </div>

          {/* Step 3: Live Policy & Refund Breakdown Card */}
          <div className="bg-gradient-to-br from-gray-50 to-red-50/30 border border-red-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gray-800">
                  Policy Refund Estimate
                </span>
              </div>
              {loadingQuote ? (
                <span className="text-xs text-gray-400 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> Calculating...
                </span>
              ) : (
                quote?.policyAppliedLabel && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                    {quote.policyAppliedLabel}
                  </span>
                )
              )}
            </div>

            {quote && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Cancelled Portion Value:</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    ₹{quote.cancelledPortionAmount?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cancellation Fee ({100 - (quote.refundPercentage || 0)}%):</span>
                  <span className="font-semibold text-red-600 font-mono">
                    -₹{quote.cancellationFee?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-900">Net Refund Amount:</span>
                  <span className="font-extrabold text-emerald-600 font-mono text-base">
                    ₹{quote.netRefundAmount?.toLocaleString() || 0}
                  </span>
                </div>
                {quote.operationalDelayWaiver && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Flight Delay Waiver applied: 100% full refund approved!</span>
                  </div>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  • {quote.expectedTimelineText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition"
          >
            Keep Reservation
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={submitting || loadingQuote}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Processing Cancellation...
              </>
            ) : (
              `Confirm Cancel & Refund`
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

