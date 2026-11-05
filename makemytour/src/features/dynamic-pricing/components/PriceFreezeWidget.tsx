import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Lock, Unlock, Clock, ShieldCheck, Snowflake } from "lucide-react";
import { PriceLockResponse } from "../types/pricing.types";
import { createPriceLock, fetchActivePriceLock } from "../api/pricingApi";
import { usePriceFreezeCountdown } from "../hooks/usePriceFreezeCountdown";

interface PriceFreezeWidgetProps {
  entityType: string;
  entityId: number;
  currentPrice: number;
  onPriceLocked?: (lock: PriceLockResponse) => void;
}

export const PriceFreezeWidget: React.FC<PriceFreezeWidgetProps> = ({
  entityType,
  entityId,
  currentPrice,
  onPriceLocked,
}) => {
  const user = useSelector((state: any) => state.user.user);
  const [activeLock, setActiveLock] = useState<PriceLockResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const countdown = usePriceFreezeCountdown(
    activeLock?.expiresAt,
    activeLock?.remainingSeconds
  );

  useEffect(() => {
    if (!user?.id || !entityId) return;

    let isMounted = true;
    fetchActivePriceLock(user.id, entityType, entityId)
      .then((lock) => {
        if (isMounted && lock) {
          setActiveLock(lock);
          if (onPriceLocked) onPriceLocked(lock);
        }
      })
      .catch((e) => console.error("Error checking active lock:", e));

    return () => {
      isMounted = false;
    };
  }, [user?.id, entityType, entityId]);

  const handleFreeze = async () => {
    if (!user?.id) {
      setErrorMsg("Please login to freeze this price for 30 minutes.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const lock = await createPriceLock(user.id, entityType, entityId);
      setActiveLock(lock);
      if (onPriceLocked) {
        onPriceLocked(lock);
      }
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Failed to freeze price. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFrozen = activeLock !== null && !countdown.isExpired;

  if (isFrozen) {
    const isEndingSoon = countdown.totalRemainingSeconds < 300; // <5 mins
    return (
      <div
        className={`rounded-xl p-4 border transition-all ${
          isEndingSoon
            ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-300"
            : "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-300"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isEndingSoon ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Snowflake className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Price Freeze Active
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm font-extrabold text-gray-900">
                Frozen at ₹{activeLock.lockedPrice.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-gray-500 flex items-center gap-1 justify-end font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Expires in
            </span>
            <span
              className={`font-mono text-base font-black ${
                isEndingSoon ? "text-amber-600 animate-pulse" : "text-emerald-700"
              }`}
            >
              {countdown.display}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-gray-600 mt-2 border-t border-emerald-200/50 pt-2">
          Your rate is protected against live demand spikes during checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleFreeze}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Lock className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        {loading
          ? "Locking Rate..."
          : `Freeze Price for 30 Mins (₹${Number(currentPrice || 0).toLocaleString("en-IN")})`}
      </button>

      {errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default PriceFreezeWidget;

