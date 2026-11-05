import { useEffect, useState } from "react";
import { getAdminHotels, createAdminHotel, updateAdminHotel, deleteAdminHotel } from "../api/adminApi";
import type { AdminHotel } from "../types/admin.types";
import { Plus, Edit2, Trash2, Building2, X, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

function HotelModal({ hotel, onClose, onSuccess }: { hotel: AdminHotel | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: hotel?.name || "",
    city: hotel?.city || "",
    address: hotel?.address || "",
    availableRooms: String(hotel?.availableRooms || ""),
    starRating: String(hotel?.starRating || "3"),
    pricePerNight: String(hotel?.pricePerNight || ""),
    active: hotel?.active !== false,
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const payload: any = {
        name: form.name, city: form.city, address: form.address || form.city,
        availableRooms: Number(form.availableRooms), starRating: Number(form.starRating),
        pricePerNight: Number(form.pricePerNight), active: form.active,
        imageUrl: form.imageUrl || undefined,
      };
      if (hotel) {
        await updateAdminHotel(hotel.id, payload);
        setMsg({ type: "success", text: "Hotel updated!" });
      } else {
        await createAdminHotel(payload);
        setMsg({ type: "success", text: "Hotel created!" });
      }
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
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
            <Building2 className="w-4 h-4 text-green-400" />
            {hotel ? `Edit Hotel #${hotel.id}` : "Add New Hotel"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {msg && (
            <div className={`text-xs p-3 rounded-lg flex items-center gap-2 ${msg.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {msg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Hotel Name</label>
            <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. The Taj Palace" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">City</label>
              <input required value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="e.g. Mumbai" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Star Rating (1-5)</label>
              <input type="number" min="1" max="5" value={form.starRating} onChange={e => setForm(f => ({...f, starRating: e.target.value}))} className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Price per Night (₹)</label>
              <input required type="number" value={form.pricePerNight} onChange={e => setForm(f => ({...f, pricePerNight: e.target.value}))} placeholder="e.g. 4500" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Available Rooms</label>
              <input required type="number" value={form.availableRooms} onChange={e => setForm(f => ({...f, availableRooms: e.target.value}))} placeholder="e.g. 20" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Image URL (optional)</label>
            <input value={form.imageUrl} onChange={e => setForm(f => ({...f, imageUrl: e.target.value}))} placeholder="https://..." className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50" />
            {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 h-20 w-full object-cover rounded-lg border border-gray-700" onError={e => e.currentTarget.style.display = 'none'} />}
          </div>

          {hotel && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} className="rounded" />
              <span className="text-sm text-gray-300">Active (visible in search)</span>
            </label>
          )}

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Saving..." : hotel ? "Update Hotel" : "Create Hotel"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function HotelsManagementTab() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [editing, setEditing] = useState<AdminHotel | null | "new">(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setHotels(await getAdminHotels());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (h: AdminHotel) => {
    try {
      await updateAdminHotel(h.id, { active: !h.active });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = hotels.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
    const matchActive = filterActive === "ALL" || (filterActive === "ACTIVE" ? h.active : !h.active);
    return matchSearch && matchActive;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Hotel Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">{hotels.length} hotels total</p>
        </div>
        <button onClick={() => setEditing("new")} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Add Hotel
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotel, city..." className="w-full pl-9 pr-4 py-2 bg-[#1a1d27] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500/50" />
        </div>
        {["ALL", "ACTIVE", "INACTIVE"].map(f => (
          <button key={f} onClick={() => setFilterActive(f as any)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterActive === f ? "bg-green-600 text-white" : "bg-[#1a1d27] border border-gray-700 text-gray-400 hover:text-white"}`}>{f}</button>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 p-3 bg-red-500/10 rounded-lg">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-gray-500 text-xs animate-pulse">Loading hotels...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500 text-xs">No hotels found.</div>
        ) : filtered.map(h => (
          <div key={h.id} className={`bg-[#1a1d27] border rounded-xl p-4 space-y-3 ${h.active ? "border-gray-800" : "border-gray-800/50 opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white text-sm">{h.name}</p>
                <p className="text-xs text-gray-400">{h.city} · {h.starRating}★</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.active ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                {h.active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>₹{Math.round(Number(h.pricePerNight || 0)).toLocaleString("en-IN")}/night</span>
              <span>{h.availableRooms} rooms</span>
            </div>
            {h.hasActiveBookings && <p className="text-[10px] text-yellow-400">🔖 Has active bookings</p>}
            <div className="flex gap-2">
              <button onClick={() => setEditing(h)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-700 hover:border-blue-500/50 text-gray-400 hover:text-blue-400 text-xs transition-all">
                <Edit2 className="w-3 h-3" />Edit
              </button>
              <button onClick={() => handleToggle(h)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs transition-all ${h.active ? "border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400" : "border-gray-700 hover:border-green-500/50 text-gray-400 hover:text-green-400"}`}>
                {h.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <HotelModal
          hotel={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}

