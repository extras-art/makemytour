import { useState } from "react";
import api from "@/api";
import {
  TrendingUp,
  Shield,
  Zap,
  Calculator,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function PricingManagementTab() {
  const [entityType, setEntityType] = useState<"FLIGHT" | "HOTEL">("FLIGHT");
  const [entityId, setEntityId] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId) return;
    setLoading(true);
    setError(null);
    setBreakdown(null);
    try {
      const res = await api.get(
        `/api/pricing/${entityType.toLowerCase()}/${entityId}/breakdown`
      );
      setBreakdown(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to compute dynamic price breakdown"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Dynamic Pricing Engine & Rules
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Inspect dynamic surge formulas, baseline price cache anchors, and live breakdown simulations
        </p>
      </div>

      {/* Rules Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Demand Surge Multiplier</h3>
              <p className="text-xs text-gray-400">Occupancy & scarcity curves</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Multipliers ramp smoothly up to <span className="text-sky-300 font-mono font-bold">+60%</span> as seats or rooms cross 70%, 85%, and 95% occupancy thresholds.
          </p>
        </div>

        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Price Freeze Vault</h3>
              <p className="text-xs text-gray-400">15-minute lock duration</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Users can lock a quoted price for <span className="text-purple-300 font-mono font-bold">15 minutes</span> with cryptographic tokens that prevent mid-checkout surges.
          </p>
        </div>

        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Baseline Anchors & Guardrails</h3>
              <p className="text-xs text-gray-400">Boundary safety caps</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            All prices are bounded strictly between <span className="text-emerald-300 font-mono font-bold">0.75x</span> (floor) and <span className="text-emerald-300 font-mono font-bold">2.50x</span> (ceiling) of the baseline anchor.
          </p>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-800">
          <Calculator className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold text-white">
            Live Pricing Breakdown Simulator
          </h3>
        </div>

        <form onSubmit={handleSimulate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Entity Type
            </label>
            <div className="flex rounded-lg bg-[#0f1117] p-1 border border-gray-700">
              <button
                type="button"
                onClick={() => setEntityType("FLIGHT")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  entityType === "FLIGHT"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Flight
              </button>
              <button
                type="button"
                onClick={() => setEntityType("HOTEL")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  entityType === "HOTEL"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Hotel
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Entity ID
            </label>
            <input
              type="number"
              min="1"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-32 px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition shadow-md shadow-red-900/30"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Computing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Compute Live Price
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 flex items-center gap-2 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {breakdown && (
          <div className="mt-6 bg-[#0f1117] border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 pb-3">
              <div>
                <span className="text-xs uppercase font-bold text-gray-400">
                  {breakdown.entityType} #{breakdown.entityId}
                </span>
                <p className="text-lg font-bold text-white">{breakdown.entityName || "Inventory Item"}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Computed Dynamic Price</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ₹{breakdown.finalPrice?.toLocaleString() || breakdown.finalPrice}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-[#1a1d27] p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 mb-1">Base Price Anchor</p>
                <p className="text-white text-base font-bold">₹{breakdown.basePrice}</p>
              </div>
              <div className="bg-[#1a1d27] p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 mb-1">Surge Amount</p>
                <p className="text-amber-400 text-base font-bold">+₹{breakdown.surgeAmount || 0}</p>
              </div>
              <div className="bg-[#1a1d27] p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 mb-1">Discount Amount</p>
                <p className="text-emerald-400 text-base font-bold">-₹{breakdown.discountAmount || 0}</p>
              </div>
              <div className="bg-[#1a1d27] p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 mb-1">Total Multiplier</p>
                <p className="text-sky-400 text-base font-bold">
                  {breakdown.finalMultiplier ? `${breakdown.finalMultiplier.toFixed(2)}x` : "1.00x"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

