import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingDown,
  Clock,
  CheckCircle2,
  RefreshCw,
  Coins,
  FileQuestion,
} from "lucide-react";
import type { CancellationTrendStats } from "../types/cancellation.types";
import { CANCELLATION_REASONS } from "../types/cancellation.types";
import { getCancellationReasonAnalytics } from "../api/cancellationApi";

export default function CancellationReasonAnalyticsWidget() {
  const [stats, setStats] = useState<CancellationTrendStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCancellationReasonAnalytics();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load cancellation analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getReasonLabel = (key: string): string => {
    const found = CANCELLATION_REASONS.find((r) => r.value === key);
    return found ? found.label : key.replace(/_/g, " ");
  };

  const total = stats?.totalCancellations || 0;

  // Sort reasons by count descending
  const sortedReasons = stats?.reasonCounts
    ? Object.entries(stats.reasonCounts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              Cancellation & Policy Refund Analytics
            </h3>
            <p className="text-[11px] text-gray-400">
              Real-time intelligence on customer cancellation drivers and financial disbursements
            </p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition disabled:opacity-50"
          title="Refresh analytics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error ? (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-xs text-red-300">
          {error}
        </div>
      ) : loading && !stats ? (
        <div className="py-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
          <span>Aggregating cancellation records...</span>
        </div>
      ) : (
        <>
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#12141c] p-3 rounded-lg border border-gray-800/70">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                Total Cancellations
              </span>
              <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                {stats?.totalCancellations || 0}
              </span>
            </div>

            <div className="bg-[#12141c] p-3 rounded-lg border border-gray-800/70">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                Total Disbursed
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                ₹{stats?.totalRefundedAmount?.toLocaleString() || 0}
              </span>
            </div>

            <div className="bg-[#12141c] p-3 rounded-lg border border-gray-800/70">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                Pending Approval
              </span>
              <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">
                {stats?.pendingRefundsCount || 0}
              </span>
            </div>

            <div className="bg-[#12141c] p-3 rounded-lg border border-gray-800/70">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                Completed Refunds
              </span>
              <span className="text-lg font-bold text-purple-400 font-mono mt-0.5 block">
                {stats?.completedRefundsCount || 0}
              </span>
            </div>
          </div>

          {/* Reason Breakdown Bars */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-gray-300 block">
              Top Cancellation Drivers
            </span>
            {sortedReasons.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">
                No cancellation records recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedReasons.map(([reasonKey, count]) => {
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={reasonKey} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 truncate font-medium">
                          {getReasonLabel(reasonKey)}
                        </span>
                        <span className="text-gray-400 font-mono text-[11px] ml-2 flex-shrink-0">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#12141c] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

