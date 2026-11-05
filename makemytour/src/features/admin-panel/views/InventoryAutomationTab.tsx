import { useEffect, useState } from "react";
import {
  getInventoryRefreshStatus,
  triggerInventoryRefresh,
} from "../api/adminApi";
import {
  RefreshCw,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Plane,
  Building2,
  Activity,
  Layers,
} from "lucide-react";

export default function InventoryAutomationTab() {
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [statusData, setStatusData] = useState<{
    running: boolean;
    lastExecutionTime?: string;
    lastSummary?: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await getInventoryRefreshStatus();
      setStatusData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory refresh status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerRefresh = async () => {
    setTriggering(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await triggerInventoryRefresh();
      setSuccessMsg(
        `Refresh executed successfully! Duration: ${res.executionDurationMs}ms · Status: ${res.status}`
      );
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || "Failed to trigger inventory refresh");
    } finally {
      setTriggering(false);
    }
  };

  const summary = statusData?.lastSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Inventory Automation Engine
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Midnight MySQL inventory synchronization, synthetic flight creation, and price normalization
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#1a1d27] border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-700/50 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-700/50 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Engine State */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Engine State</span>
            <Activity className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                statusData?.running
                  ? "bg-amber-400 animate-ping"
                  : "bg-emerald-400 shadow-lg shadow-emerald-500/50"
              }`}
            />
            <p className="text-xl font-bold text-white">
              {statusData?.running ? "Running Cycle..." : "Idle / Standing By"}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Cron Schedule: <span className="text-sky-300 font-mono">0 0 0 * * *</span> (Midnight Daily)
          </p>
        </div>

        {/* Card 2: Last Execution */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Execution</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white">
            {statusData?.lastExecutionTime
              ? new Date(statusData.lastExecutionTime).toLocaleString()
              : "Never"}
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Trigger Type: <span className="text-purple-300 font-semibold">{summary?.triggerType || "N/A"}</span>
            {summary?.executionDurationMs ? ` (${summary.executionDurationMs}ms)` : ""}
          </p>
        </div>

        {/* Card 3: Execution Control */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Manual Trigger</span>
              <Database className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Instantly run the inventory update pipeline across flights and hotels without waiting for midnight.
            </p>
          </div>
          <button
            onClick={handleTriggerRefresh}
            disabled={triggering || statusData?.running}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-md shadow-red-900/30 transition"
          >
            {triggering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Trigger Immediate Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Report from Last Run */}
      {summary && (
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Latest Execution Summary</h3>
                <p className="text-xs text-gray-400">
                  {summary.executedAt ? new Date(summary.executedAt).toLocaleString() : "Recent"} · Status:{" "}
                  <span className="text-emerald-400 font-semibold">{summary.status || "COMPLETED"}</span>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700 font-mono">
              {summary.executionDurationMs} ms
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#12141c] p-4 rounded-lg border border-gray-800/80">
              <p className="text-xs text-gray-400 mb-1">Deactivated Flights</p>
              <p className="text-2xl font-bold text-amber-400">{summary.deactivatedFlightsCount || 0}</p>
              <p className="text-[11px] text-gray-500 mt-1">Past departure schedule</p>
            </div>
            <div className="bg-[#12141c] p-4 rounded-lg border border-gray-800/80">
              <p className="text-xs text-gray-400 mb-1">New Flights Injected</p>
              <p className="text-2xl font-bold text-emerald-400">{summary.newFlightsCount || 0}</p>
              <p className="text-[11px] text-gray-500 mt-1">Synthetic replacements</p>
            </div>
            <div className="bg-[#12141c] p-4 rounded-lg border border-gray-800/80">
              <p className="text-xs text-gray-400 mb-1">Flights Normalized</p>
              <p className="text-2xl font-bold text-sky-400">{summary.updatedFlightsCount || 0}</p>
              <p className="text-[11px] text-gray-500 mt-1">Anchor baseline reset</p>
            </div>
            <div className="bg-[#12141c] p-4 rounded-lg border border-gray-800/80">
              <p className="text-xs text-gray-400 mb-1">Hotels Normalized</p>
              <p className="text-2xl font-bold text-purple-400">{summary.updatedHotelsCount || 0}</p>
              <p className="text-[11px] text-gray-500 mt-1">Room capacity & rates</p>
            </div>
          </div>

          {summary.message && (
            <div className="text-xs font-mono bg-[#0f1117] p-3 rounded-lg border border-gray-800 text-gray-300">
              {summary.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

