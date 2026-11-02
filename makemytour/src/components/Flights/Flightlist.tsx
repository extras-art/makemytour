import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getallflightsadmin, deactivateflight } from "@/api";
import Loader from "../Loader";
import TrackFlightButton from "@/features/flight-status/components/TrackFlightButton";

interface FlightListProps {
  onSelect: (flight: any) => void;
  refreshTrigger?: number;
  onRefresh?: () => void;
}

const FlightList = ({ onSelect, refreshTrigger, onRefresh }: FlightListProps) => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingId, setDeactivatingId] = useState<number | string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await getallflightsadmin();
      setFlights(data);
    } catch (error) {
      console.error("Error fetching flights for admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [refreshTrigger]);

  const handleDeactivate = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to deactivate this flight? It will be hidden from search.")) {
      return;
    }
    setDeactivatingId(id);
    setActionError(null);
    try {
      await deactivateflight(id);
      await fetchFlights();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Failed to deactivate flight:", error);
      setActionError(error?.message || "Failed to deactivate flight. Please try again.");
    } finally {
      setDeactivatingId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Flight Inventory</h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {flights.length} flights
        </span>
      </div>

      {actionError && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {actionError}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Flight / Airline</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.length > 0 ? (
              flights.map((f: any) => (
                <TableRow key={f.id ?? f._id}>
                  <TableCell className="font-medium">{f.flightName || f.airline}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {f.from || f.source} → {f.to || f.destination}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    ₹ {Number(f.price || 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{f.availableSeats ?? 0}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        f.active !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {f.active !== false ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <TrackFlightButton flightId={f.id} size="sm" />
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => onSelect(f)}
                    >
                      Edit
                    </Button>
                    {f.active !== false && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        disabled={deactivatingId === f.id}
                        onClick={() => handleDeactivate(f.id)}
                      >
                        {deactivatingId === f.id ? "Deactivating..." : "Deactivate"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No flights found in system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FlightList;
