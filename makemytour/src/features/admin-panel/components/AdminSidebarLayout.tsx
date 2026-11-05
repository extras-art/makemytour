import {
  LayoutDashboard,
  Users,
  Plane,
  Building2,
  BookOpen,
  RefreshCw,
  TrendingUp,
  ClipboardList,
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearUser } from "@/store";
import { logout as apiLogout } from "@/api";
import { useRouter } from "next/router";
import type { AdminTab } from "../types/admin.types";

interface SidebarItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: SidebarItem[] = [
  { id: "overview", label: "Dashboard Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "users", label: "User Management", icon: <Users className="w-4 h-4" /> },
  { id: "flights", label: "Flight Management", icon: <Plane className="w-4 h-4" /> },
  { id: "hotels", label: "Hotel Management", icon: <Building2 className="w-4 h-4" /> },
  { id: "bookings", label: "Booking Management", icon: <BookOpen className="w-4 h-4" /> },
  { id: "bookings", label: "Cancellation & Refunds", icon: <RefreshCw className="w-4 h-4" /> },
  { id: "inventory", label: "Inventory Automation", icon: <RefreshCw className="w-4 h-4" /> },
  { id: "pricing", label: "Pricing Management", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "audit", label: "Admin Activity Logs", icon: <ClipboardList className="w-4 h-4" /> },
];

// De-dup so "Booking Management" and "Cancellation & Refunds" both map to "bookings" tab
const UNIQUE_NAV: SidebarItem[] = [
  { id: "overview", label: "Dashboard Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "users", label: "User Management", icon: <Users className="w-4 h-4" /> },
  { id: "flights", label: "Flight Management", icon: <Plane className="w-4 h-4" /> },
  { id: "hotels", label: "Hotel Management", icon: <Building2 className="w-4 h-4" /> },
  { id: "bookings", label: "Booking & Refund Mgmt", icon: <BookOpen className="w-4 h-4" /> },
  { id: "inventory", label: "Inventory Automation", icon: <RefreshCw className="w-4 h-4" /> },
  { id: "pricing", label: "Pricing Management", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "audit", label: "Admin Activity Logs", icon: <ClipboardList className="w-4 h-4" /> },
];

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  adminEmail?: string;
  adminName?: string;
  children: React.ReactNode;
}

export default function AdminSidebarLayout({
  activeTab,
  onTabChange,
  adminEmail,
  adminName,
  children,
}: Props) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    dispatch(clearUser());
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1a1d27] border-r border-gray-800 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">MakeMyTour</p>
              <p className="text-[10px] text-red-400 font-mono uppercase tracking-wider">Command Center</p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
          <p className="text-[10px] mt-0.5 font-bold text-red-400 uppercase tracking-wider">Administrator</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Navigation</p>
          {UNIQUE_NAV.map((item, idx) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-red-600/15 text-red-400 border border-red-600/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-red-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
            Back to Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top nav (simplified) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1a1d27] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Admin Panel</span>
        </div>
        <button onClick={handleLogout} className="text-red-400 text-sm font-medium">
          Logout
        </button>
      </div>

      {/* Mobile tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1a1d27] border-t border-gray-800 flex overflow-x-auto">
        {UNIQUE_NAV.slice(0, 5).map((item, idx) => (
          <button
            key={`m-${item.id}-${idx}`}
            onClick={() => onTabChange(item.id)}
            className={`flex-1 min-w-[60px] flex flex-col items-center py-2 px-1 text-[10px] transition-all ${
              activeTab === item.id ? "text-red-400" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="mt-0.5 truncate">{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0 overflow-y-auto bg-[#0f1117] min-h-screen">
        {children}
      </main>
    </div>
  );
}

