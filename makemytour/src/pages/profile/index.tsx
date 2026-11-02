import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  User,
  Phone,
  Mail,
  Edit2,
  MapPin,
  Calendar,
  CreditCard,
  X,
  Check,
  LogOut,
  Plane,
  Building2,
  AlertCircle,
  AlertTriangle,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, getuserbookings, cancelbooking } from "@/api";
import Loader from "@/components/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface NormalizedBooking {
  id: string | number;
  type: "Flight" | "Hotel" | "Booking";
  title: string;
  formattedDate: string;
  formattedPrice: string;
  location: string;
  status: string;
  paymentStatus: string;
  quantity: number;
  nights?: number;
  checkInDate?: string;
  checkOutDate?: string;
  unitPrice?: string;
  taxesAndFees?: string;
  canCancel: boolean;
}

const formatCurrency = (val: any): string => {
  if (val === null || val === undefined || val === "") return "0";
  const num = Number(val);
  return isNaN(num)
    ? "0"
    : num.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      });
};

const normalizeBooking = (booking: any): NormalizedBooking => {
  if (!booking || typeof booking !== "object") {
    return {
      id: "N/A",
      type: "Booking",
      title: "Unknown Booking",
      formattedDate: "Date unavailable",
      formattedPrice: "0",
      location: "Location unavailable",
      status: "Status unavailable",
      paymentStatus: "Payment status unavailable",
      quantity: 1,
      canCancel: false,
    };
  }

  const isFlight = Boolean(booking.flight);
  const isHotel = Boolean(booking.hotel);
  const type: "Flight" | "Hotel" | "Booking" = isFlight
    ? "Flight"
    : isHotel
    ? "Hotel"
    : "Booking";

  const id = booking.id ?? "N/A";

  // Parse createdAt safely
  let formattedDate = "Date unavailable";
  const dateField = booking.createdAt ?? booking.date;
  if (dateField) {
    const d = new Date(dateField);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }

  // Currency formatted fields
  const formattedPrice = formatCurrency(booking.totalPrice ?? booking.price);
  const unitPrice = booking.unitPriceSnapshot
    ? formatCurrency(booking.unitPriceSnapshot)
    : undefined;
  const taxesAndFees = booking.taxesAndFees
    ? formatCurrency(booking.taxesAndFees)
    : undefined;

  // Title and location
  let title = type;
  let location = "Location unavailable";

  if (isFlight) {
    const flight = booking.flight;
    const airlineName = flight.airline || flight.flightName || "Flight";
    const src = flight.source || flight.from || "";
    const dest = flight.destination || flight.to || "";
    const route =
      src && dest ? `${src} → ${dest}` : src || dest || "Route unavailable";

    title = airlineName;
    location = route;
  } else if (isHotel) {
    const hotel = booking.hotel;
    const hotelName = hotel.name || hotel.hotelName || "Hotel";
    const city =
      hotel.city || hotel.location || hotel.address || "City unavailable";

    title = hotelName;
    location = city;
  }

  const status = booking.status ? String(booking.status) : "CONFIRMED";
  const canCancel = status.toUpperCase() === "CONFIRMED";

  let paymentStatus = "Payment status unavailable";
  if (booking.paymentStatus) {
    paymentStatus = String(booking.paymentStatus);
  } else if (booking.payment?.status) {
    paymentStatus = String(booking.payment.status);
  }

  return {
    id,
    type,
    title,
    formattedDate,
    formattedPrice,
    location,
    status,
    paymentStatus,
    quantity: Number(booking.quantity) || 1,
    nights: booking.nights,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    unitPrice,
    taxesAndFees,
    canCancel,
  };
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const isAuthLoaded = useSelector((state: any) => state.user.isAuthLoaded);
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoaded && !user) {
      router.replace("/");
    }
  }, [isAuthLoaded, user, router]);

  const logout = () => {
    dispatch(clearUser());
    router.push("/");
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [bookings, setBookings] = useState<NormalizedBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState<boolean>(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Cancellation state
  const [selectedBookingForCancel, setSelectedBookingForCancel] =
    useState<NormalizedBooking | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  // Sync user state to form data
  useEffect(() => {
    if (user) {
      let fName = user.firstName || "";
      let lName = user.lastName || "";
      if (!fName && user.name) {
        const parts = String(user.name).trim().split(" ");
        fName = parts[0] || "";
        lName = parts.slice(1).join(" ") || "";
      }
      setUserData({
        firstName: fName,
        lastName: lName,
        email: user.email || "",
        phoneNumber: user.phone || user.phoneNumber || "",
      });
    }
  }, [user]);

  // Fetch real bookings from backend
  const fetchBookings = async () => {
    if (!user?.id) {
      setBookingsLoading(false);
      setBookings([]);
      return;
    }

    try {
      setBookingsLoading(true);
      setBookingsError(null);
      const data = await getuserbookings(user.id);
      const list = Array.isArray(data) ? data : [];
      setBookings(list.map(normalizeBooking));
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err);
      setBookingsError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bookings. Please try again."
      );
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  const handleEditFormChange = (field: string, value: string) => {
    setUserData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const fullName = `${userData.firstName} ${userData.lastName}`.trim();
    if (!fullName) {
      setEditError("Name cannot be empty.");
      return;
    }

    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const updatedUser = await editprofile(user?.id, {
        name: fullName,
        phone: userData.phoneNumber,
      });

      const mergedUser = {
        ...user,
        ...updatedUser,
        name: updatedUser.name,
        phone: updatedUser.phone,
      };

      dispatch(setUser(mergedUser));
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(mergedUser));
      }

      setEditSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile edit failed:", error);
      setEditError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
    if (user) {
      let fName = user.firstName || "";
      let lName = user.lastName || "";
      if (!fName && user.name) {
        const parts = String(user.name).trim().split(" ");
        fName = parts[0] || "";
        lName = parts.slice(1).join(" ") || "";
      }
      setUserData({
        firstName: fName,
        lastName: lName,
        email: user.email || "",
        phoneNumber: user.phone || user.phoneNumber || "",
      });
    }
  };

  const openCancelModal = (booking: NormalizedBooking) => {
    setSelectedBookingForCancel(booking);
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelbooking(selectedBookingForCancel.id);
      setCancelSuccess(
        `Booking #${selectedBookingForCancel.id} has been cancelled successfully.`
      );
      setCancelModalOpen(false);
      setSelectedBookingForCancel(null);
      await fetchBookings();
    } catch (err: any) {
      console.error("Cancellation failed:", err);
      setCancelError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel booking. Please try again."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // Safe user display values
  const displayName =
    user?.name?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "User";

  const displayEmail = user?.email || "Not provided";

  const displayPhone =
    user?.phone || user?.phoneNumber || "Not provided";

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] pt-8 pb-16 px-4">
      <Head>
        <title>My Account & Bookings | MakeMyTour</title>
        <meta
          name="description"
          content="View and manage your travel bookings, flight tickets, hotel reservations, and personal profile on MakeMyTour."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="max-w-6xl mx-auto">
        {/* Alerts */}
        {cancelSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium">{cancelSuccess}</span>
            </div>
            <button
              onClick={() => setCancelSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {editSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium">{editSuccess}</span>
            </div>
            <button
              onClick={() => setEditSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your personal information</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setEditError(null);
                      setEditSuccess(null);
                      setIsEditing(true);
                    }}
                    className="text-red-600 flex items-center space-x-1 hover:text-red-700 transition-colors text-sm font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  {editError && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) =>
                        handleEditFormChange("firstName", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) =>
                        handleEditFormChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Email (Read-Only)
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userData.phoneNumber}
                      placeholder="10-digit phone number"
                      onChange={(e) =>
                        handleEditFormChange("phoneNumber", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={editLoading}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm font-semibold disabled:bg-gray-400"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editLoading ? "Saving..." : "Save"}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={editLoading}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm font-semibold"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-semibold text-gray-400 block">Full Name</span>
                      <p className="font-semibold text-gray-900">{displayName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-semibold text-gray-400 block">Email Address</span>
                      <p className="text-sm font-medium text-gray-800">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-semibold text-gray-400 block">Phone</span>
                      <p className="text-sm font-medium text-gray-800">{displayPhone}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage and track your travel reservations</p>
                </div>
                {!bookingsLoading && bookings.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                  </span>
                )}
              </div>

              {bookingsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-3">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm">Loading your bookings...</p>
                </div>
              ) : bookingsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-3">
                  <p className="text-red-700 font-medium text-sm">{bookingsError}</p>
                  <button
                    onClick={fetchBookings}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : !user ? (
                <div className="text-center py-12 text-gray-500 space-y-2">
                  <p className="text-base font-medium">Please log in to view your bookings.</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">No bookings found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    You haven&apos;t made any flight or hotel bookings yet. Explore flights and hotels to start your journey!
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors bg-white shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          {booking.type === "Flight" ? (
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 flex-shrink-0 mt-0.5">
                              <Plane className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100 flex-shrink-0 mt-0.5">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-gray-900 text-base">{booking.title}</h3>
                              <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded">
                                #{booking.id}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{booking.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-lg text-gray-900">
                            ₹ {booking.formattedPrice}
                          </p>
                          <span
                            className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                              booking.status.toUpperCase() === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800"
                                : booking.status.toUpperCase() === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Details Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mb-4">
                        <div>
                          <span className="text-gray-400 block uppercase font-semibold text-[10px]">Booked On</span>
                          <span className="font-medium text-gray-800 flex items-center mt-0.5">
                            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                            {booking.formattedDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block uppercase font-semibold text-[10px]">
                            {booking.type === "Flight" ? "Passengers / Seats" : "Rooms & Nights"}
                          </span>
                          <span className="font-medium text-gray-800 flex items-center mt-0.5">
                            <Users className="w-3 h-3 mr-1 text-gray-400" />
                            {booking.type === "Flight"
                              ? `${booking.quantity} ${booking.quantity === 1 ? "Seat" : "Seats"}`
                              : `${booking.quantity} ${booking.quantity === 1 ? "Room" : "Rooms"}${booking.nights ? ` (${booking.nights}N)` : ""}`}
                          </span>
                        </div>
                        {booking.checkInDate && (
                          <div>
                            <span className="text-gray-400 block uppercase font-semibold text-[10px]">Stay Dates</span>
                            <span className="font-medium text-gray-800 mt-0.5 block truncate">
                              {booking.checkInDate} to {booking.checkOutDate || "N/A"}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-400 block uppercase font-semibold text-[10px]">Payment</span>
                          <span className="font-medium text-gray-800 flex items-center mt-0.5 truncate">
                            <CreditCard className="w-3 h-3 mr-1 text-gray-400" />
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {booking.unitPrice && (
                            <span>Base: ₹{booking.unitPrice} {booking.taxesAndFees && `| Taxes: ₹${booking.taxesAndFees}`}</span>
                          )}
                        </div>

                        {booking.canCancel && (
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Cancel Booking #{selectedBookingForCancel?.id}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm mt-1">
              Are you sure you want to cancel your reservation for{" "}
              <strong className="text-gray-900">{selectedBookingForCancel?.title}</strong>?
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{cancelError}</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p>
              • Cancelled bookings release reserved seats/rooms immediately back into inventory.
            </p>
            <p>
              • This action cannot be reversed once confirmed.
            </p>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelLoading}
              className="flex-1 py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelLoading}
              className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:bg-gray-400"
            >
              {cancelLoading ? "Cancelling..." : "Yes, Cancel Booking"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
