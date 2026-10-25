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
import { getallhotelsadmin, deactivatehotel } from "@/api";
import Loader from "../Loader";

interface HotelListProps {
  onSelect: (hotel: any) => void;
  refreshTrigger?: number;
  onRefresh?: () => void;
}

const HotelList = ({ onSelect, refreshTrigger, onRefresh }: HotelListProps) => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingId, setDeactivatingId] = useState<number | string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await getallhotelsadmin();
      setHotels(data);
    } catch (error) {
      console.error("Error fetching hotels for admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [refreshTrigger]);

  const handleDeactivate = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to deactivate this hotel? It will be hidden from search.")) {
      return;
    }
    setDeactivatingId(id);
    setActionError(null);
    try {
      await deactivatehotel(id);
      await fetchHotels();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Failed to deactivate hotel:", error);
      setActionError(error?.message || "Failed to deactivate hotel. Please try again.");
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
        <h3 className="text-lg font-bold text-gray-900">Hotel Inventory</h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {hotels.length} hotels
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
              <TableHead>Hotel Name</TableHead>
              <TableHead>City / Location</TableHead>
              <TableHead>Price / Night</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotels.length > 0 ? (
              hotels.map((h: any) => (
                <TableRow key={h.id ?? h._id}>
                  <TableCell className="font-medium">{h.hotelName || h.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{h.location || h.city}</TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    ₹ {Number(h.pricePerNight || 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{h.availableRooms ?? 0}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        h.active !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {h.active !== false ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => onSelect(h)}
                    >
                      Edit
                    </Button>
                    {h.active !== false && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        disabled={deactivatingId === h.id}
                        onClick={() => handleDeactivate(h.id)}
                      >
                        {deactivatingId === h.id ? "Deactivating..." : "Deactivate"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No hotels found in system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HotelList;
