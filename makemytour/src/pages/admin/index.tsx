"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import FlightList from "@/components/Flights/Flightlist";
import HotelList from "@/components/Hotel/Hotel";
import {
  addflight,
  addhotel,
  editflight,
  edithotel,
  getuserbyemail,
  getallbookingsadmin,
  getauditlogs,
  cancelbooking,
} from "@/api";
import {
  Plane,
  Building2,
  Users,
  Calendar,
  ShieldAlert,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
} from "lucide-react";

interface User {
  id?: string | number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  phone?: string;
  phoneNumber?: string;
  createdAt?: string;
}

function UserSearch() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await getuserbyemail(email.trim());
      setUser(data || null);
    } catch (err: any) {
      console.error("Error searching user:", err);
      setError(err?.message || "User search failed.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Search registered user by email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {user ? (
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-gray-900 text-base">User Record</h4>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {user.role || "ROLE_USER"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase block">Name</span>
              <p className="font-medium text-gray-800">
                {user.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase block">Email</span>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase block">Phone</span>
              <p className="font-medium text-gray-800">{user.phone || user.phoneNumber || "Not provided"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase block">User ID</span>
              <p className="font-medium text-gray-800">#{user.id}</p>
            </div>
          </div>
        </div>
      ) : searched && !loading && !error ? (
        <p className="text-sm text-gray-500 italic">No registered user found with email &quot;{email}&quot;.</p>
      ) : null}
    </div>
  );
}

interface Hotel {
  id?: string | number;
  hotelName?: string;
  name?: string;
  location?: string;
  city?: string;
  address?: string;
  pricePerNight?: number;
  availableRooms?: number;
  starRating?: number;
  amenities?: string;
  active?: boolean;
}

function AddEditHotel({
  hotel,
  onSuccess,
  onCancel,
}: {
  hotel: Hotel | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    hotelName: "",
    location: "",
    address: "",
    pricePerNight: "",
    availableRooms: "",
    starRating: "3",
    amenities: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (hotel) {
      setFormData({
        hotelName: hotel.hotelName || hotel.name || "",
        location: hotel.location || hotel.city || "",
        address: hotel.address || hotel.location || hotel.city || "",
        pricePerNight: String(hotel.pricePerNight ?? ""),
        availableRooms: String(hotel.availableRooms ?? ""),
        starRating: String(hotel.starRating ?? 3),
        amenities: hotel.amenities || "",
        active: hotel.active !== false,
      });
    } else {
      setFormData({
        hotelName: "",
        location: "",
        address: "",
        pricePerNight: "",
        availableRooms: "",
        starRating: "3",
        amenities: "",
        active: true,
      });
    }
    setStatusMsg(null);
  }, [hotel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      if (hotel?.id) {
        await edithotel(hotel.id, {
          name: formData.hotelName,
          city: formData.location,
          address: formData.address || formData.location,
          pricePerNight: Number(formData.pricePerNight),
          availableRooms: Number(formData.availableRooms),
          starRating: Number(formData.starRating),
          active: formData.active,
        });
        setStatusMsg({ type: "success", text: "Hotel updated successfully!" });
      } else {
        await addhotel(
          formData.hotelName,
          formData.location,
          Number(formData.pricePerNight),
          Number(formData.availableRooms),
          formData.amenities
        );
        setStatusMsg({ type: "success", text: "New hotel added successfully!" });
        setFormData({
          hotelName: "",
          location: "",
          address: "",
          pricePerNight: "",
          availableRooms: "",
          starRating: "3",
          amenities: "",
          active: true,
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Hotel submit failed:", error);
      setStatusMsg({
        type: "error",
        text: error?.message || "Failed to save hotel. Please check your inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-bold text-gray-900">
          {hotel ? `Edit Hotel #${hotel.id}` : "Add New Hotel"}
        </h3>
        {hotel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-xs">
            Cancel Edit
          </Button>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-3 text-xs rounded-lg flex items-center space-x-2 ${
            statusMsg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div>
        <Label htmlFor="hotelName">Hotel Name</Label>
        <Input
          id="hotelName"
          name="hotelName"
          value={formData.hotelName}
          onChange={handleChange}
          required
          placeholder="e.g. The Taj Palace"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="location">City / Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="e.g. Mumbai"
          />
        </div>
        <div>
          <Label htmlFor="starRating">Star Rating (1-5)</Label>
          <Input
            id="starRating"
            name="starRating"
            type="number"
            min="1"
            max="5"
            value={formData.starRating}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="pricePerNight">Price Per Night (₹)</Label>
          <Input
            id="pricePerNight"
            name="pricePerNight"
            type="number"
            value={formData.pricePerNight}
            onChange={handleChange}
            required
            placeholder="e.g. 4500"
          />
        </div>
        <div>
          <Label htmlFor="availableRooms">Available Rooms</Label>
          <Input
            id="availableRooms"
            name="availableRooms"
            type="number"
            value={formData.availableRooms}
            onChange={handleChange}
            required
            placeholder="e.g. 20"
          />
        </div>
      </div>

      {hotel && (
        <div className="flex items-center space-x-2 pt-1">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-red-600 rounded border-gray-300"
          />
          <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
            Active in Search (uncheck to hide)
          </Label>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
      >
        {loading ? "Saving..." : hotel ? "Update Hotel" : "Add Hotel"}
      </Button>
    </form>
  );
}

interface Flight {
  id?: string | number;
  flightName?: string;
  airline?: string;
  from?: string;
  source?: string;
  to?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  availableSeats?: number;
  active?: boolean;
}

function AddEditFlight({
  flight,
  onSuccess,
  onCancel,
}: {
  flight: Flight | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    flightName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    availableSeats: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const formatForInput = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "";
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (flight) {
      setFormData({
        flightName: flight.flightName || flight.airline || "",
        from: flight.from || flight.source || "",
        to: flight.to || flight.destination || "",
        departureTime: formatForInput(flight.departureTime),
        arrivalTime: formatForInput(flight.arrivalTime),
        price: String(flight.price ?? ""),
        availableSeats: String(flight.availableSeats ?? ""),
        active: flight.active !== false,
      });
    } else {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: "",
        availableSeats: "",
        active: true,
      });
    }
    setStatusMsg(null);
  }, [flight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      if (flight?.id) {
        await editflight(flight.id, {
          flightName: formData.flightName,
          from: formData.from,
          to: formData.to,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          price: Number(formData.price),
          availableSeats: Number(formData.availableSeats),
          active: formData.active,
        });
        setStatusMsg({ type: "success", text: "Flight updated successfully!" });
      } else {
        await addflight(
          formData.flightName,
          formData.from,
          formData.to,
          formData.departureTime,
          formData.arrivalTime,
          Number(formData.price),
          Number(formData.availableSeats)
        );
        setStatusMsg({ type: "success", text: "New flight added successfully!" });
        setFormData({
          flightName: "",
          from: "",
          to: "",
          departureTime: "",
          arrivalTime: "",
          price: "",
          availableSeats: "",
          active: true,
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Flight submit failed:", error);
      setStatusMsg({
        type: "error",
        text: error?.message || "Failed to save flight. Please check your inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-bold text-gray-900">
          {flight ? `Edit Flight #${flight.id}` : "Add New Flight"}
        </h3>
        {flight && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-xs">
            Cancel Edit
          </Button>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-3 text-xs rounded-lg flex items-center space-x-2 ${
            statusMsg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div>
        <Label htmlFor="flightName">Airline / Flight Name</Label>
        <Input
          id="flightName"
          name="flightName"
          value={formData.flightName}
          onChange={handleChange}
          required
          placeholder="e.g. IndiGo 6E-204"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="from">Origin City (From)</Label>
          <Input
            id="from"
            name="from"
            value={formData.from}
            onChange={handleChange}
            required
            placeholder="e.g. Delhi"
          />
        </div>
        <div>
          <Label htmlFor="to">Destination City (To)</Label>
          <Input
            id="to"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            placeholder="e.g. Mumbai"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="departureTime">Departure Time</Label>
          <Input
            id="departureTime"
            name="departureTime"
            type="datetime-local"
            value={formData.departureTime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="arrivalTime">Arrival Time</Label>
          <Input
            id="arrivalTime"
            name="arrivalTime"
            type="datetime-local"
            value={formData.arrivalTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="e.g. 5200"
          />
        </div>
        <div>
          <Label htmlFor="availableSeats">Available Seats</Label>
          <Input
            id="availableSeats"
            name="availableSeats"
            type="number"
            value={formData.availableSeats}
            onChange={handleChange}
            required
            placeholder="e.g. 120"
          />
        </div>
      </div>

      {flight && (
        <div className="flex items-center space-x-2 pt-1">
          <input
            id="flightActive"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-red-600 rounded border-gray-300"
          />
          <Label htmlFor="flightActive" className="text-sm font-medium cursor-pointer">
            Active in Search (uncheck to hide)
          </Label>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
      >
        {loading ? "Saving..." : flight ? "Update Flight" : "Add Flight"}
      </Button>
    </form>
  );
}

function AdminBookingsView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState<number | string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getallbookingsadmin();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: number | string) => {
    if (!window.confirm(`Are you sure you want to cancel booking #${id}? Inventory will be restored.`)) {
      return;
    }
    setCancellingId(id);
    setCancelError(null);
    try {
      await cancelbooking(id);
      await fetchBookings();
    } catch (err: any) {
      console.error("Admin cancel failed:", err);
      setCancelError(err?.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return String(b.status).toUpperCase() === filter;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      {cancelError && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {cancelError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {["ALL", "CONFIRMED", "CANCELLED"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-red-600 hover:bg-red-700 text-white" : ""}
            >
              {f} ({bookings.filter((b) => f === "ALL" || String(b.status).toUpperCase() === f).length})
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          Refresh
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>User / Customer</TableHead>
              <TableHead>Reservation</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((b: any) => {
                const isFlight = Boolean(b.flight);
                const title = isFlight
                  ? b.flight.airline || b.flight.flightName || "Flight"
                  : b.hotel?.name || b.hotel?.hotelName || "Hotel";
                const customer = b.user?.name || b.user?.email || `User #${b.user?.id || "N/A"}`;
                const isConfirmed = String(b.status).toUpperCase() === "CONFIRMED";

                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs font-semibold">#{b.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1.5 text-xs font-medium">
                        {isFlight ? (
                          <Plane className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-green-600" />
                        )}
                        <span>{isFlight ? "Flight" : "Hotel"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium text-gray-900">{customer}</p>
                      <p className="text-xs text-gray-500">{b.user?.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium text-gray-800">{title}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {b.quantity || 1} {isFlight ? "seats" : `rooms (${b.nights || 1}N)`}
                      </p>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 text-sm">
                      ₹ {Number(b.totalPrice || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isConfirmed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isConfirmed && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          disabled={cancellingId === b.id}
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No bookings found for filter {filter}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminAuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getauditlogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-gray-900">Administrative Audit Trail</h3>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          Refresh
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-gray-600 font-mono">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-gray-800">
                    {log.adminEmail || "system"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {log.entityType} #{log.entityId}
                  </TableCell>
                  <TableCell className="text-xs text-gray-700 max-w-xs truncate">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No administrative actions logged yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const user = useSelector((state: any) => state.user.user);
  const isAuthLoaded = useSelector((state: any) => state.user.isAuthLoaded);
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoaded) {
      const isAdmin = user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN");
      if (!isAdmin) {
        router.replace("/");
      }
    }
  }, [isAuthLoaded, user, router]);

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const isAdmin = user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN");
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-16 h-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 text-sm mb-6">
          You must have administrator privileges (ROLE_ADMIN) to access this dashboard.
        </p>
        <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700 text-white">
          Return to Home
        </Button>
      </div>
    );
  }

  const handleFlightSuccess = () => {
    setSelectedFlight(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleHotelSuccess = () => {
    setSelectedHotel(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] pb-16 pt-6 px-4">
      <Head>
        <title>Admin Dashboard | MakeMyTour</title>
        <meta
          name="description"
          content="Administrative portal for MakeMyTour flights, hotels, reservations, and audit trail."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">MakeMyTour Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Logged in as <strong className="text-gray-800">{user.email}</strong> ({user.role})
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="text-xs font-semibold"
          >
            Back to Site
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white border rounded-xl p-1 shadow-sm text-gray-700">
            <TabsTrigger value="flights" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold">
              Flights
            </TabsTrigger>
            <TabsTrigger value="hotels" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold">
              Hotels
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold">
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold">
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights" className="mt-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Flight Management</CardTitle>
                <CardDescription className="text-xs">
                  Create, edit, and deactivate flights. Deactivated flights are preserved for booking integrity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <FlightList
                      onSelect={setSelectedFlight}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger((p) => p + 1)}
                    />
                  </div>
                  <div>
                    <AddEditFlight
                      flight={selectedFlight}
                      onSuccess={handleFlightSuccess}
                      onCancel={() => setSelectedFlight(null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotels" className="mt-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Hotel Management</CardTitle>
                <CardDescription className="text-xs">
                  Create, update, and manage hotel inventory and room availability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <HotelList
                      onSelect={setSelectedHotel}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger((p) => p + 1)}
                    />
                  </div>
                  <div>
                    <AddEditHotel
                      hotel={selectedHotel}
                      onSuccess={handleHotelSuccess}
                      onCancel={() => setSelectedHotel(null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">All Customer Reservations</CardTitle>
                <CardDescription className="text-xs">
                  Inspect bookings across all users and process administrative cancellations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminBookingsView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">System Audit Log</CardTitle>
                <CardDescription className="text-xs">
                  Immutable record of all administrative creations, edits, deactivations, and cancellations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAuditLogsView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">User Directory</CardTitle>
                <CardDescription className="text-xs">
                  Lookup customer records and check account details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserSearch />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
