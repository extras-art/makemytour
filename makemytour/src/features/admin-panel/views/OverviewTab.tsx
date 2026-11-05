import { useEffect, useState } from "react";
import { getAdminOverview } from "../api/adminApi";
import type { AdminOverviewStats } from "../types/admin.types";
import {
  Users,
  Plane,
  Building2,
  BookOpen,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

function KpiCard({
  title,
  value,
  sub,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function AvailabilityBar({ label, active, total }: { label: string; active: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((active / total) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{active}/{total} active ({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOverview();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error || "Failed to load overview"}</p>
        <button onClick={load} className="text-xs text-gray-400 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time platform statistics</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-5 h-5 text-blue-400" />} color="bg-blue-500/10" />
        <KpiCard title="Total Flights" value={stats.totalFlights} sub={`${stats.activeFlights} active`} icon={<Plane className="w-5 h-5 text-purple-400" />} color="bg-purple-500/10" />
        <KpiCard title="Total Hotels" value={stats.totalHotels} sub={`${stats.activeHotels} active`} icon={<Building2 className="w-5 h-5 text-green-400" />} color="bg-green-500/10" />
        <KpiCard title="Total Bookings" value={stats.totalBookings} sub={`${stats.confirmedBookings} confirmed`} icon={<BookOpen className="w-5 h-5 text-orange-400" />} color="bg-orange-500/10" />
      </div>

      {/* Booking stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1d27] border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Confirmed</p>
            <p className="text-xl font-bold text-green-400">{stats.confirmedBookings}</p>
          </div>
        </div>
        <div className="bg-[#1a1d27] border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Cancelled</p>
            <p className="text-xl font-bold text-red-400">{stats.cancelledBookings}</p>
          </div>
        </div>
        <div className="bg-[#1a1d27] border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Refund Pending</p>
            <p className="text-xl font-bold text-yellow-400">{stats.refundPendingBookings}</p>
          </div>
        </div>
        <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-xl p-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Refunded</p>
            <p className="text-xl font-bold text-cyan-400">{stats.refundedBookings}</p>
          </div>
        </div>
      </div>

      {/* Availability bars */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Inventory Availability</h3>
        <AvailabilityBar label="Flights" active={stats.activeFlights} total={stats.totalFlights} />
        <AvailabilityBar label="Hotels" active={stats.activeHotels} total={stats.totalHotels} />
      </div>

      {/* Recent Registrations */}
      {stats.recentRegistrations.length > 0 && (
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Registrations</h3>
          <div className="space-y-2">
            {stats.recentRegistrations.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'ROLE_ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
                  {u.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      {stats.recentBookings.length > 0 && (
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Bookings</h3>
          <div className="space-y-2">
            {stats.recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                <div className="flex items-center gap-2.5">
                  {b.type === "FLIGHT" ? <Plane className="w-3.5 h-3.5 text-blue-400" /> : <Building2 className="w-3.5 h-3.5 text-green-400" />}
                  <div>
                    <p className="text-sm text-white font-medium">{b.entityName}</p>
                    <p className="text-xs text-gray-500">{b.customerName} · ₹{Number(b.totalPrice).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.status === "CONFIRMED" ? "bg-green-500/20 text-green-400" :
                  b.status === "CANCELLED" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Inventory Summary */}
      {stats.lastInventorySummary && (
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Last Inventory Refresh Summary</h3>
          <pre className="text-xs text-gray-400 overflow-auto">
            {JSON.stringify(stats.lastInventorySummary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

