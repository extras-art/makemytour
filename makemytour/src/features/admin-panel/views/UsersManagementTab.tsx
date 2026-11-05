import { useEffect, useState } from "react";
import { getAdminUsers, getAdminUserDetail, updateAdminUserRole } from "../api/adminApi";
import type { AdminUser, AdminUserDetail, AdminBooking } from "../types/admin.types";
import { Search, ChevronRight, X, Shield, User as UserIcon } from "lucide-react";

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAdmin ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-300"}`}>
      {isAdmin ? "ADMIN" : "USER"}
    </span>
  );
}

function UserDrawer({ user, onClose, currentAdminEmail }: { user: AdminUser; onClose: () => void; currentAdminEmail?: string }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleMsg, setRoleMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminUserDetail(user.id).then(setDetail).catch(() => {}).finally(() => setLoading(false));
  }, [user.id]);

  const handleRoleToggle = async () => {
    if (!detail) return;
    if (detail.user.email === currentAdminEmail) {
      setRoleMsg({ type: "error", text: "You cannot change your own role (self-lockout protection)." });
      return;
    }
    setRoleLoading(true);
    setRoleMsg(null);
    const newRole = detail.user.role === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN";
    try {
      const updated = await updateAdminUserRole(user.id, newRole);
      setDetail(d => d ? { ...d, user: updated } : d);
      setRoleMsg({ type: "success", text: `Role updated to ${newRole}` });
    } catch (err: any) {
      setRoleMsg({ type: "error", text: err.message });
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1d27] border-l border-gray-700 h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-[#1a1d27] border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">{user.name}</h3>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Profile */}
          <div className="bg-[#0f1117] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold uppercase">Role</span>
              <RoleBadge role={detail?.user.role || user.role} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Phone</span>
              <span className="text-sm text-gray-300">{user.phone || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Joined</span>
              <span className="text-sm text-gray-300">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}</span>
            </div>
          </div>

          {/* Role toggle */}
          {roleMsg && (
            <div className={`text-xs p-3 rounded-lg ${roleMsg.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {roleMsg.text}
            </div>
          )}
          <button
            onClick={handleRoleToggle}
            disabled={roleLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-gray-700 hover:border-red-500/50 hover:text-red-400 text-gray-300 transition-all disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            {roleLoading ? "Updating..." : `Switch to ${detail?.user.role === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN"}`}
          </button>

          {/* Bookings */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Booking History ({detail?.bookings.length || 0})</h4>
            {loading ? (
              <p className="text-xs text-gray-500 animate-pulse">Loading bookings...</p>
            ) : (
              <div className="space-y-2">
                {(detail?.bookings || []).map((b: AdminBooking) => (
                  <div key={b.id} className="bg-[#0f1117] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-300">{b.entityName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${b.status === "CONFIRMED" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{b.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">₹{Number(b.totalPrice).toLocaleString("en-IN")} · {b.type} · Qty: {b.quantity}</p>
                  </div>
                ))}
                {detail?.bookings.length === 0 && <p className="text-xs text-gray-500 italic">No bookings yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersManagementTab({ currentAdminEmail }: { currentAdminEmail?: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers(search || undefined, roleFilter || undefined);
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-[#1a1d27] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-[#1a1d27] border border-gray-700 rounded-lg text-sm text-gray-300 px-3 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="ROLE_USER">USER</option>
          <option value="ROLE_ADMIN">ADMIN</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
          Search
        </button>
      </form>

      {error && <p className="text-xs text-red-400 p-3 bg-red-500/10 rounded-lg">{error}</p>}

      {/* Table */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1117]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-xs animate-pulse">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-xs">No users found.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-t border-gray-800/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-xs text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(u)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <UserDrawer
          user={selected}
          onClose={() => setSelected(null)}
          currentAdminEmail={currentAdminEmail}
        />
      )}
    </div>
  );
}

