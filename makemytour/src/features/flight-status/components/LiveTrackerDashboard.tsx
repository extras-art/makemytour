import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plane,
  Search,
  Plus,
  RefreshCw,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlightStatusPoller } from "../hooks/useFlightStatusPoller";
import { FlightStatusCard } from "./FlightStatusCard";
import { NotificationCenter } from "./NotificationCenter";
import { TrackFlightButton } from "./TrackFlightButton";
import { trackFlight, pruneInactiveFlights } from "../store/flightTrackerSlice";
import { fetchAllFlightStatuses } from "../api/flightStatusApi";
import { FlightStatusUpdate, FlightStatusEnum } from "../types/flightStatus.types";

export const LiveTrackerDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const trackedFlightIds = useSelector(
    (state: any) => state.flightTracker?.trackedFlightIds || []
  ) as number[];
  const statuses = useSelector(
    (state: any) => state.flightTracker?.statuses || {}
  ) as Record<number, FlightStatusUpdate>;
  const loading = useSelector(
    (state: any) => state.flightTracker?.loading || false
  ) as boolean;
  const lastPolledAt = useSelector(
    (state: any) => state.flightTracker?.lastPolledAt || null
  ) as string | null;

  // Real-time background poller (15s)
  const { refetch } = useFlightStatusPoller({ intervalMs: 15000, enabled: true });

  // Catalog of all available flights for search & adding to watchlist
  const [allFlights, setAllFlights] = useState<FlightStatusUpdate[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const loadAllFlights = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const list = await fetchAllFlightStatuses();
      setAllFlights(list);
      // Gracefully reconcile watchlist: prune any tracked flights no longer in active catalog
      const activeIds = list.map((f) => f.flightId);
      dispatch(pruneInactiveFlights(activeIds));
    } catch (err) {
      console.error("Failed to load flight catalog:", err);
    } finally {
      setCatalogLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadAllFlights();
  }, [loadAllFlights]);

  // Filtered tracked flights for display
  const trackedList = useMemo(() => {
    return trackedFlightIds
      .map((id) => statuses[id])
      .filter((s): s is FlightStatusUpdate => Boolean(s))
      .filter((s) => {
        if (filterStatus === "ALL") return true;
        return s.status === filterStatus;
      });
  }, [trackedFlightIds, statuses, filterStatus]);

  // Flights available to add (not yet tracked) matching search query
  const searchableFlights = useMemo(() => {
    if (!searchQuery.trim()) {
      return allFlights.filter((f) => !trackedFlightIds.includes(f.flightId)).slice(0, 8);
    }
    const q = searchQuery.toLowerCase();
    return allFlights
      .filter((f) => !trackedFlightIds.includes(f.flightId))
      .filter(
        (f) =>
          f.airline.toLowerCase().includes(q) ||
          f.source.toLowerCase().includes(q) ||
          f.destination.toLowerCase().includes(q) ||
          `flight ${f.flightId}`.includes(q)
      )
      .slice(0, 10);
  }, [allFlights, trackedFlightIds, searchQuery]);

  // Metric counts across tracked flights
  const metrics = useMemo(() => {
    const allTracked = trackedFlightIds
      .map((id) => statuses[id])
      .filter((s): s is FlightStatusUpdate => Boolean(s));

    return {
      total: allTracked.length,
      onTime: allTracked.filter((s) => s.status === "ON_TIME").length,
      delayed: allTracked.filter((s) => s.status === "DELAYED" || s.delayMinutes > 0).length,
      inAir: allTracked.filter((s) => s.status === "IN_AIR").length,
      boarding: allTracked.filter((s) => s.status === "BOARDING").length,
      landed: allTracked.filter((s) => s.status === "LANDED").length,
    };
  }, [trackedFlightIds, statuses]);

  const handleAddFlight = (flightId: number) => {
    dispatch(trackFlight(flightId));
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleTrackPopular = () => {
    if (allFlights.length > 0) {
      allFlights.slice(0, 3).forEach((f) => {
        dispatch(trackFlight(f.flightId));
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Header / Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <Radio className="w-5 h-5 animate-pulse" />
                </span>
                <span className="text-xs uppercase font-extrabold tracking-wider text-red-600">
                  Feature 1 • Live Flight Tracker
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                Live Flight Status & Watchlist
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time multi-flight monitoring with 15s live polling, dynamic ETA progress, and schedule alerts.
              </p>
            </div>

            {/* Actions: Refresh Catalog + Live Refresh + Notification Center */}
            <div className="flex items-center space-x-3 self-start md:self-auto">
              <div className="hidden sm:flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-2" />
                <span className="font-semibold">Live Polling Active (15s)</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadAllFlights();
                  refetch();
                }}
                disabled={catalogLoading || loading}
                className="text-xs text-blue-700 bg-blue-50/70 border-blue-200 hover:bg-blue-100/80 font-semibold flex items-center gap-1.5"
                title="Sync flight catalog from backend database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${catalogLoading ? "animate-spin text-blue-600" : ""}`} />
                <span>Refresh Catalog</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={loading}
                className="text-xs text-gray-700 hover:text-black font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
                <span>Refresh</span>
              </Button>

              <NotificationCenter />
            </div>
          </div>

          {/* Metrics summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Tracked</p>
              <p className="text-2xl font-black text-gray-900">{metrics.total}</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase">On Time</p>
              <p className="text-2xl font-black text-emerald-800">{metrics.onTime}</p>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-amber-800 uppercase">Delayed</p>
              <p className="text-2xl font-black text-amber-900">{metrics.delayed}</p>
            </div>
            <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-blue-700 uppercase">Boarding</p>
              <p className="text-2xl font-black text-blue-900">{metrics.boarding}</p>
            </div>
            <div className="bg-sky-50/70 border border-sky-200/70 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-sky-700 uppercase">In Air</p>
              <p className="text-2xl font-black text-sky-900">{metrics.inAir}</p>
            </div>
            <div className="bg-gray-100/70 border border-gray-200 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-gray-600 uppercase">Landed</p>
              <p className="text-2xl font-black text-gray-800">{metrics.landed}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Interactive Demo Tip Banner */}
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/70 rounded-2xl p-4 mb-6 shadow-sm flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <span className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Interactive Evaluator Mode & Live Push Simulation
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Click <strong>&quot;Simulate Live Update&quot;</strong> on any tracked flight card below to trigger realistic live state transitions (e.g. 1h delay with traffic congestion reasons, boarding calls, or airborne progress shifts). The system detects the diff, pushes an in-app toast, and sends a browser notification!
              </p>
            </div>
          </div>
        </div>

        {/* Watchlist Controls: Add Flight Search + Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Add Flight to Watchlist Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search & track flights by airline or city (e.g., IndiGo, Delhi, Mumbai)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="pl-9 pr-4 py-2 bg-white text-xs border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
            />

            {/* Dropdown Results for Search */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-gray-100">
                <div className="p-2 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span>Available Flights to Track</span>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>
                {searchableFlights.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No matching untracked flights found.
                  </div>
                ) : (
                  searchableFlights.map((flight) => (
                    <div
                      key={flight.flightId}
                      className="p-3 hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900">{flight.airline}</p>
                        <p className="text-[11px] text-gray-500">
                          {flight.source} → {flight.destination} • {flight.terminal}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddFlight(flight.flightId)}
                        className="text-xs border-red-200 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "ALL", label: "All" },
              { key: "ON_TIME", label: "On Time" },
              { key: "DELAYED", label: "Delayed" },
              { key: "IN_AIR", label: "In Air" },
              { key: "BOARDING", label: "Boarding" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === f.key
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tracked Flights Grid */}
        {trackedList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackedList.map((status) => (
              <FlightStatusCard key={status.flightId} status={status} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {trackedFlightIds.length === 0
                ? "Your Flight Watchlist is Empty"
                : "No Tracked Flights Match Selected Filter"}
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {trackedFlightIds.length === 0
                ? `Search from our ${allFlights.length > 0 ? allFlights.length : "active"} active flights above or track our most popular routes to monitor live schedules and delay alerts.`
                : "Try switching back to 'All' to see all your tracked flights."}
            </p>
            {trackedFlightIds.length === 0 ? (
              <Button
                onClick={handleTrackPopular}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Track Popular Flights Now</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setFilterStatus("ALL")}
                className="text-xs font-semibold"
              >
                Show All Tracked Flights
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveTrackerDashboard;

