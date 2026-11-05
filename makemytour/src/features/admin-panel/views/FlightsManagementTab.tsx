import { useEffect, useState } from "react";
import { getAdminFlights, createAdminFlight, updateAdminFlight, deleteAdminFlight } from "../api/adminApi";
import type { AdminFlight } from "../types/admin.types";
import { Plus, Edit2, Trash2, Plane, AlertTriangle, CheckCircle2, X, Search } from "lucide-react";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

function FlightModal({
  flight,
  onClose,
  onSuccess,
}: {
  flight: AdminFlight | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    airline: flight?.airline || "",
    source: flight?.source || "",
    destination: flight?.destination || "",
    departureTime: flight?.departureTime ? flight.departureTime.slice(0, 16) : "",
    arrivalTime: flight?.arrivalTime ? flight.arrivalTime.slice(0, 16) : "",
    price: String(flight?.price || ""),
    availableSeats: String(flight?.availableSeats || ""),
    active: flight?.active !== false,
    forceScheduleUpdate: false,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForceConfirm, setShowForceConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const payload: any = {
        airline: form.airline,
        source: form.source,
        destination: form.destination,
        departureTime: form.departureTime || undefined,
        arrivalTime: form.arrivalTime || undefined,
        price: Number(form.price),
        availableSeats: Number(form.availableSeats),
        active: form.active,
      };
      if (flight) {
        payload.forceScheduleUpdate = form.forceScheduleUpdate;
        await updateAdminFlight(flight.id, payload);
        setMsg({ type: "success", text: "Flight updated successfully!" });
      } else {
        await createAdminFlight(payload);
        setMsg({ type: "success", text: "Flight created successfully!" });
      }
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    } catch (err: any) {
      if (err.message?.includes("forceScheduleUpdate") || err.message?.includes("CONFLICT")) {
        setShowForceConfirm(true);
        setMsg({ type: "error", text: "This flight has active bookings. Force schedule update?" });
      } else {
        setMsg({ type: "error", text: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#1a1d27] border border-gray-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1d27] border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plane className="w-4 h-4 text-blue-400" />
            {flight ? `Edit Flight #${flight.id}` : "Add New Flight"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {flight?.hasActiveBookings && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400">This flight has active bookings. Schedule changes require confirmation.</p>
            </div>
          )}

          {msg && (
            <div className={`text-xs p-3 rounded-lg flex items-center gap-2 ${msg.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {msg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Airline / Flight Name</label>
            <input required value={form.airline} onChange={e => setForm(f => ({...f, airline: e.target.value}))} placeholder="e.g. IndiGo 6E-204" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">From (Origin)</label>
              <input required value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value}))} placeholder="e.g. Delhi" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">To (Destination)</label>
              <input required value={form.destination} onChange={e => setForm(f => ({...f, destination: e.target.value}))} placeholder="e.g. Mumbai" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Departure Time</label>
              <input type="datetime-local" value={form.departureTime} onChange={e => setForm(f => ({...f, departureTime: e.target.value}))} className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Arrival Time</label>
              <input type="datetime-local" value={form.arrivalTime} onChange={e => setForm(f => ({...f, arrivalTime: e.target.value}))} className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Price (₹)</label>
              <input required type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="e.g. 5200" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Available Seats</label>
              <input required type="number" value={form.availableSeats} onChange={e => setForm(f => ({...f, availableSeats: e.target.value}))} placeholder="e.g. 120" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50" />
            </div>
          </div>

          {flight && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} className="rounded" />
              <span className="text-sm text-gray-300">Active (visible in search)</span>
            </label>
          )}

          {showForceConfirm && (
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <input type="checkbox" checked={form.forceScheduleUpdate} onChange={e => setForm(f => ({...f, forceScheduleUpdate: e.target.checked}))} className="rounded" />
              <span className="text-sm text-yellow-400">Force schedule update (affects existing bookings)</span>
            </label>
          )}

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Saving..." : flight ? "Update Flight" : "Create Flight"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FlightsManagementTab() {
  const [flights, setFlights] = useState<AdminFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [editing, setEditing] = useState<AdminFlight | null | "new">(null);
  const [deleting, setDeleting] = useState<AdminFlight | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setFlights(await getAdminFlights());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (f: AdminFlight) => {
    setDeleting(f);
    setDeleteMsg(null);
    try {
      const res = await deleteAdminFlight(f.id);
      setDeleteMsg(res.message);
      await load();
      setTimeout(() => setDeleting(null), 2000);
    } catch (err: any) {
      setDeleteMsg(err.message);
    }
  };

  const filtered = flights.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.airline.toLowerCase().includes(q) || f.source.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q);
    const matchActive = filterActive === "ALL" || (filterActive === "ACTIVE" ? f.active : !f.active);
    return matchSearch && matchActive;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Flight Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">{flights.length} flights total</p>
        </div>
        <button onClick={() => setEditing("new")} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Add Flight
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search airline, route..." className="w-full pl-9 pr-4 py-2 bg-[#1a1d27] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50" />
        </div>
        {["ALL", "ACTIVE", "INACTIVE"].map(f => (
          <button key={f} onClick={() => setFilterActive(f as any)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterActive === f ? "bg-red-600 text-white" : "bg-[#1a1d27] border border-gray-700 text-gray-400 hover:text-white"}`}>{f}</button>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 p-3 bg-red-500/10 rounded-lg">{error}</p>}

      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1117]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Flight</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Route</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Seats</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-xs animate-pulse">Loading flights...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-xs">No flights found.</td></tr>
            ) : filtered.map(f => (
              <tr key={f.id} className="border-t border-gray-800/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">{f.airline}</p>
                      <p className="text-[10px] text-gray-500">#{f.id}{f.hasActiveBookings && " · 🔖 booked"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-300">{f.source} → {f.destination}</td>
                <td className="px-4 py-3 text-xs font-semibold text-white">₹{Math.round(Number(f.price || 0)).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-xs text-gray-300">{f.availableSeats}</td>
                <td className="px-4 py-3"><StatusBadge active={f.active} /></td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                  <button onClick={() => setEditing(f)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete/deactivate Flight #${f.id}?\n${f.hasActiveBookings ? "⚠️ Has active bookings — will soft-deactivate." : "Will be soft-deactivated."}`)) {
                        handleDelete(f);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <FlightModal
          flight={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSuccess={load}
        />
      )}

      {deleting && deleteMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a1d27] border border-gray-700 rounded-xl p-4 text-sm text-gray-200 shadow-xl max-w-xs">
          {deleteMsg}
        </div>
      )}
    </div>
  );
}

