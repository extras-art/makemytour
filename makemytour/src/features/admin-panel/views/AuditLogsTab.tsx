import { useEffect, useState } from "react";
import { getAdminAuditLogs } from "../api/adminApi";
import type { AdminAuditLog } from "../types/admin.types";
import {
  ClipboardList,
  RefreshCw,
  Search,
  ShieldAlert,
  Clock,
  User,
  Tag,
  AlertCircle,
} from "lucide-react";

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const getActionBadge = (action: string) => {
    let colorClass = "bg-gray-700 text-gray-300 border-gray-600";
    if (action.includes("CREATE") || action.includes("ADD")) {
      colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    } else if (action.includes("UPDATE") || action.includes("EDIT")) {
      colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    } else if (action.includes("DEACTIVATE") || action.includes("DELETE") || action.includes("REMOVE")) {
      colorClass = "bg-red-500/10 text-red-400 border-red-500/20";
    } else if (action.includes("ROLE") || action.includes("USER")) {
      colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
    } else if (action.includes("BOOKING") || action.includes("REFUND")) {
      colorClass = "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {action}
      </span>
    );
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterAction === "ALL" || log.action === filterAction;
    if (!matchesFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.adminEmail?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.entityType?.toLowerCase().includes(term) ||
      log.details?.toLowerCase().includes(term)
    );
  });

  const uniqueActions = ["ALL", ...Array.from(new Set(logs.map((l) => l.action)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Security & Audit Activity Trail
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Tamper-evident chronological activity log of all administrative actions and mutations
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#1a1d27] border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Stream
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-700/50 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#0f1117] border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          >
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act === "ALL" ? "All Actions" : act}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search email, action, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
            <p className="text-sm">Retrieving audit ring buffer...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No audit records match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#12141c] text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just now"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-white">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono">{log.adminEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className="font-semibold text-gray-200">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-gray-400 font-mono ml-1">#{log.entityId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300 font-mono max-w-md truncate">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

