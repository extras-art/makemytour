import { useEffect, useState } from "react";
import {
  getAdminBookings,
  updateBookingStatus,
} from "../api/adminApi";
import CancellationReasonAnalyticsWidget from "@/features/cancellation-refund/components/CancellationReasonAnalyticsWidget";
import type { AdminBooking } from "../types/admin.types";
import {
  Search,
  RefreshCw,
  Plane,
  Building2,
  CheckCircle,
  Clock,
  Ban,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export default function BookingsAndRefundsTab() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBookings = async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminBookings(status === "ALL" ? undefined : status);
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(statusFilter);
  }, [statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    setProcessingId(bookingId);
    try {
      const updated = await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: updated.status } : b))
      );
      showToast(`Booking #${bookingId} status updated to ${newStatus}`);
    } catch (err: any) {
      alert(err.message || "Failed to update booking status");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.id.toString().includes(term) ||
      b.customerName?.toLowerCase().includes(term) ||
      b.customerEmail?.toLowerCase().includes(term) ||
      b.entityName?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case "REFUND_PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="w-3 h-3" /> Refund Pending
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw className="w-3 h-3" /> Refunded
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-emerald-400 animate-slideIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Booking & Refund Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time booking records and instant refund processing reflecting live on customer profile
          </p>
        </div>
        <button
          onClick={() => fetchBookings(statusFilter)}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#1a1d27] border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-700/50 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cancellation Reason Analytics Widget */}
      <CancellationReasonAnalyticsWidget />

      {/* Filter and Search Bar */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["ALL", "CONFIRMED", "REFUND_PENDING", "REFUNDED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                  : "bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {st === "ALL" ? "All Bookings" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, ID, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
            <p className="text-sm">Loading booking records...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No bookings found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#12141c] text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Item / Itinerary</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      #{b.id}
                    </td>
                    <td className="px-4 py-3">
                      {b.type === "FLIGHT" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-sky-400 font-medium">
                          <Plane className="w-3.5 h-3.5" /> Flight
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <Building2 className="w-3.5 h-3.5" /> Hotel
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{b.entityName}</p>
                      <p className="text-xs text-gray-400">
                        {b.type === "FLIGHT"
                          ? `${b.quantity} seat(s)`
                          : `${b.quantity} room(s) · ${b.nights || 1} night(s)`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{b.customerName}</p>
                      <p className="text-xs text-gray-400 font-mono">{b.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-white">
                      ₹{b.totalPrice?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {b.status === "REFUND_PENDING" && (
                        <button
                          disabled={processingId === b.id}
                          onClick={() => handleStatusChange(b.id, "REFUNDED")}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow transition disabled:opacity-50"
                        >
                          {processingId === b.id ? "Processing..." : "Approve & Complete Refund"}
                        </button>
                      )}
                      {b.status === "CANCELLED" && (
                        <button
                          disabled={processingId === b.id}
                          onClick={() => handleStatusChange(b.id, "REFUND_PENDING")}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/40 rounded text-xs font-semibold shadow transition disabled:opacity-50"
                        >
                          {processingId === b.id ? "Processing..." : "Mark in Review"}
                        </button>
                      )}
                      {b.status === "CONFIRMED" && (
                        <button
                          disabled={processingId === b.id}
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel booking #${b.id}?`)) {
                              handleStatusChange(b.id, "CANCELLED");
                            }
                          }}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-red-900/50 text-gray-300 hover:text-red-300 border border-gray-700 hover:border-red-600 rounded text-xs font-medium transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                      {b.status === "REFUNDED" && (
                        <span className="text-xs text-purple-400 font-semibold">Refund Credited</span>
                      )}
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

