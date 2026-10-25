import Head from "next/head";
import { useRouter } from "next/router";
import {
  Star,
  MapPin,
  UtensilsCrossed,
  Wine,
  Power,
  ChevronRight,
  Camera,
  Image,
  CreditCard,
  Ticket,
  Home,
  Calendar,
  Users,
  AlertCircle,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { gethotelbyid, handlehotelbooking } from "@/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";

interface Hotel {
  id: string | number;
  name?: string;
  hotelName: string;
  city?: string;
  location: string;
  address?: string;
  starRating?: number;
  pricePerNight: number;
  availableRooms: number;
  amenities?: string;
}

const BookHotelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [hotels, sethotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsCount, setRoomsCount] = useState(1);
  const [guestsCount, setGuestsCount] = useState(2);
  const [open, setopem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Today and Tomorrow in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [dateError, setDateError] = useState<string | null>(null);

  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchHotel = async () => {
      try {
        setLoading(true);
        const hotelId = Array.isArray(id) ? id[0] : id;
        const hotelData = await gethotelbyid(hotelId);
        sethotels(hotelData ? [hotelData] : []);
      } catch (error) {
        console.error("Error fetching hotel by id:", error);
        sethotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [router.isReady, id]);

  const hotel = hotels[0];
  const availableRooms = Number(hotel?.availableRooms ?? 0);
  const isSoldOut = availableRooms <= 0;

  // Nights calculation
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const cin = new Date(checkInDate).getTime();
    const cout = new Date(checkOutDate).getTime();
    if (isNaN(cin) || isNaN(cout) || cout <= cin) return 1;
    const diffDays = Math.round((cout - cin) / (1000 * 3600 * 24));
    return Math.max(1, diffDays);
  };

  const nights = calculateNights();

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIn = e.target.value;
    setCheckInDate(newIn);
    if (newIn >= checkOutDate) {
      const nextDay = new Date(newIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split("T")[0]);
      setDateError(null);
    } else {
      setDateError(null);
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOut = e.target.value;
    if (newOut <= checkInDate) {
      setDateError("Check-out date must be after check-in date.");
    } else {
      setDateError(null);
      setCheckOutDate(newOut);
    }
  };

  const handleRoomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isSoldOut) return;
    const val = parseInt(e.target.value);
    setRoomsCount(isNaN(val) ? 1 : Math.max(1, Math.min(val, availableRooms)));
  };

  // Pricing calculations
  const pricePerNight = Number(hotel?.pricePerNight ?? 0);
  const baseRoomPrice = pricePerNight * roomsCount * nights;
  const taxes = Math.round(baseRoomPrice * 0.12);
  const discount = Math.round(baseRoomPrice * 0.05); // 5% promotional discount
  const grandTotal = baseRoomPrice + taxes - discount;

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSoldOut) return;
    if (!user?.id || !hotel?.id) {
      setBookingError("Please log in before booking.");
      return;
    }
    if (dateError) {
      setBookingError(dateError);
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);
    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `hotel-${Date.now()}-${Math.random()}`;

      const data = await handlehotelbooking(
        user.id,
        Number(hotel.id),
        roomsCount,
        grandTotal,
        checkInDate,
        checkOutDate,
        idempotencyKey
      );
      const updateuser = {
        ...user,
        bookings: [...(user.bookings ?? []), data],
      };
      dispatch(setUser(updateuser));
      setopem(false);
      setRoomsCount(1);
      await router.push("/profile");
    } catch (error: any) {
      console.error("Hotel booking failed:", error);
      setBookingError(error?.message || "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (hotels.length === 0 || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Building2 className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Hotel Not Found</h2>
        <p className="text-gray-500 mb-6">No hotel details available for this ID.</p>
        <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700 text-white">
          Back to Search
        </Button>
      </div>
    );
  }

  const starRating = Number(hotel.starRating ?? 3);
  const displayLocation = hotel.location || hotel.city || "India";
  const displayAddress = hotel.address || `Near City Center, ${displayLocation}`;

  const HotelContent = () => (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center text-gray-900">
          <Home className="w-6 h-6 mr-2 text-red-600" />
          Review Hotel Reservation
        </DialogTitle>
      </DialogHeader>

      {bookingError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mt-3">
          {bookingError}
        </div>
      )}

      <div className="grid gap-5 mt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500 font-semibold uppercase">Hotel</Label>
            <Input value={hotel.hotelName || hotel.name} readOnly className="bg-gray-50 font-medium" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500 font-semibold uppercase">City & Location</Label>
            <Input value={displayLocation} readOnly className="bg-gray-50 font-medium" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500 font-semibold uppercase">Stay Dates</Label>
            <Input value={`${checkInDate} to ${checkOutDate} (${nights} ${nights === 1 ? 'night' : 'nights'})`} readOnly className="bg-gray-50 text-sm font-medium" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500 font-semibold uppercase">Rooms to Book</Label>
            <Input
              type="number"
              min="1"
              max={availableRooms}
              value={roomsCount}
              onChange={handleRoomsChange}
              className="font-medium"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-red-600" />
            Price Breakdown
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>{roomsCount} Room × {nights} Nights (₹{pricePerNight}/night)</span>
              <span className="font-semibold text-gray-900">₹ {baseRoomPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Hotel Taxes & Service Fees (12%)</span>
              <span className="font-semibold text-gray-900">₹ {taxes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600">
              <span>Special Online Booking Discount</span>
              <span className="font-semibold">- ₹ {discount.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold text-base text-gray-900">Grand Total</span>
              <span className="font-black text-xl text-red-600">₹ {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 disabled:bg-gray-400"
        onClick={handlebooking}
        disabled={isSubmitting || isSoldOut}
      >
        {isSubmitting
          ? "Confirming Reservation..."
          : isSoldOut
          ? "Hotel Sold Out"
          : "Proceed to Payment"}
      </Button>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Head>
        <title>{hotel ? `${hotel.hotelName || hotel.name} (${displayLocation}) | MakeMyTour` : "Reserve Hotel | MakeMyTour"}</title>
        <meta
          name="description"
          content={`Book your stay at ${hotel?.hotelName || hotel?.name || "Hotel"} in ${displayLocation} on MakeMyTour.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-blue-600 hover:underline">Home</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="/" className="text-blue-600 hover:underline">{displayLocation}</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">{hotel.hotelName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Hotel Details */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{hotel.hotelName}</h1>
                {isSoldOut ? (
                  <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold">
                    Sold Out
                  </span>
                ) : availableRooms <= 5 ? (
                  <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-bold">
                    Only {availableRooms} rooms left!
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                    {availableRooms} rooms available
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < starRating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-semibold text-gray-800">{starRating} Star Hotel</span>
                </div>
                <span>•</span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {displayAddress}
                </span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="col-span-2 relative group cursor-pointer overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800"
                  alt="Hotel Main"
                  className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 text-white backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-medium">Property Photos</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800"
                    alt="Hotel Room"
                    className="w-full h-[152px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800"
                    alt="Hotel Amenity"
                    className="w-full h-[152px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                    <Image className="w-4 h-4" />
                    <span className="text-xs font-medium">Guest Photos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About this Property</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to {hotel.hotelName}, located in {displayLocation}. Offering modern accommodations with premium amenities, convenient access to top local attractions, and warm hospitality for both vacationers and business travelers.
              </p>
            </div>

            {/* Amenities Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Included Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Complimentary High-speed Wi-Fi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>24/7 Room Service & Front Desk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Air Conditioning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Power Backup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free Valet Parking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Flat Screen Cable TV</span>
                </div>
              </div>
              {hotel.amenities && (
                <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Special features:</span> {hotel.amenities}
                </div>
              )}
            </div>
          </div>

          {/* Booking & Configuration Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Stay Details</h3>

              {dateError && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{dateError}</span>
                </div>
              )}

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label htmlFor="checkIn" className="text-xs font-semibold text-gray-600 flex items-center mb-1">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    CHECK-IN
                  </Label>
                  <Input
                    id="checkIn"
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={handleCheckInChange}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut" className="text-xs font-semibold text-gray-600 flex items-center mb-1">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    CHECK-OUT
                  </Label>
                  <Input
                    id="checkOut"
                    type="date"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={handleCheckOutChange}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Rooms & Guests */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <Label htmlFor="rooms" className="text-xs font-semibold text-gray-600 flex items-center mb-1">
                    <Ticket className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    ROOMS
                  </Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="1"
                    max={availableRooms}
                    value={roomsCount}
                    onChange={handleRoomsChange}
                    disabled={isSoldOut}
                  />
                </div>
                <div>
                  <Label htmlFor="guests" className="text-xs font-semibold text-gray-600 flex items-center mb-1">
                    <Users className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    GUESTS
                  </Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={roomsCount * 4}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isSoldOut}
                  />
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1.5">
                  <span>Price per night:</span>
                  <span className="font-semibold text-gray-900">₹ {pricePerNight}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1.5">
                  <span>Duration:</span>
                  <span className="font-semibold text-gray-900">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1.5">
                  <span>Rooms:</span>
                  <span className="font-semibold text-gray-900">{roomsCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Taxes (12%):</span>
                  <span className="font-semibold text-gray-900">+ ₹ {taxes}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Price:</span>
                  <span className="text-2xl font-black text-red-600">₹ {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Dialog
                open={open}
                onOpenChange={(val) => {
                  setopem(val);
                  if (val) setBookingError(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base disabled:bg-gray-400"
                    disabled={isSoldOut}
                  >
                    {isSoldOut ? "Hotel Sold Out" : "BOOK THIS NOW"}
                  </Button>
                </DialogTrigger>
                {user ? (
                  <HotelContent />
                ) : (
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Login Required</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mb-4">
                      Please log in or create an account to complete your hotel reservation.
                    </p>
                    <SignupDialog
                      trigger={
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Log In / Sign Up
                        </Button>
                      }
                    />
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookHotelPage;
