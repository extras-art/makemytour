import Head from "next/head";
import { getflight, gethotel, searchflights, searchhotels } from "@/api";
import Loader from "@/components/Loader";
import { SearchSelect } from "@/components/SearchSelect";
import SignupDialog from "@/components/SignupDialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Bus,
  Calendar,
  Car,
  CreditCard,
  HomeIcon,
  Hotel,
  MapPin,
  Plane,
  QrCode,
  Shield,
  Train,
  Umbrella,
  Users,
} from "lucide-react";
import { calculateDuration } from "@/lib/utils";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function Home() {
  const [bookingtype, setbookingtype] = useState("flights");
  const [from, setfrom] = useState("");
  const [to, setto] = useState("");
  const [date, setdate] = useState("");
  const [travelers, settravelers] = useState(1);
  const [searchresults, setsearchresult] = useState<any[]>([]);
  const [hotel, sethotel] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [flight, setflight] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<string>("price");
  const [sortDir, setSortDir] = useState<string>("asc");
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const offers = [
    {
      title: "Domestic Flights",
      description: "Get up to 20% off on domestic flights",
      imageUrl:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800",
    },
    {
      title: "International Hotels",
      description: "Book luxury hotels worldwide",
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
    },
    {
      title: "Holiday Packages",
      description: "Exclusive deals on holiday packages",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
    },
  ];

  const collections = [
    {
      title: "Stays in & Around Delhi",
      imageUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Mumbai",
      imageUrl:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Bangalore",
      imageUrl:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800",
      tag: "TOP 9",
    },
    {
      title: "Beach Destinations",
      imageUrl:
        "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=800",
      tag: "TOP 11",
    },
  ];

  const wonders = [
    {
      title: "Shimla's Best Kept Secret",
      imageUrl:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800",
    },
    {
      title: "Tamil Nadu's Charming Hill Town",
      imageUrl:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800",
    },
    {
      title: "Quaint Little Hill Station in Gujarat",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
    },
    {
      title: "A pleasant summer retreat",
      imageUrl:
        "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800",
    },
  ];

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await gethotel();
        sethotel(data);
        const flightdata = await getflight();
        setflight(flightdata);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };

    fetchdata();
  }, [user]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    flight.forEach((flight) => {
      cities.add(flight.from);
      cities.add(flight.to);
    });
    hotel.forEach((hotel) => {
      cities.add(hotel.location);
    });
    return Array.from(cities).map((city) => ({ value: city, label: city }));
  }, [flight, hotel]);

  if (loading) {
    return <Loader />;
  }
  const handlesearch = async () => {
    setSearchError(null);

    if (bookingtype === "flights") {
      if (from && to && from.trim().toLowerCase() === to.trim().toLowerCase()) {
        setSearchError("Departure ('From') and arrival ('To') cities cannot be the same.");
        return;
      }
      if (travelers < 1 || travelers > 9) {
        setSearchError("Number of travelers must be between 1 and 9.");
        return;
      }

      setIsSearching(true);
      setHasSearched(true);
      try {
        const results = await searchflights(from, to, date, travelers, sortBy, sortDir);
        setsearchresult(results);
      } catch (err: any) {
        console.error("Flight search failed:", err);
        setSearchError("Failed to fetch flight search results. Please try again.");
      } finally {
        setIsSearching(false);
      }
    } else if (bookingtype === "hotels") {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const results = to ? await searchhotels(to) : hotel;
        setsearchresult(results);
      } catch (err: any) {
        console.error("Hotel search failed:", err);
        setSearchError("Failed to fetch hotel search results. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSortChange = async (property: "price" | "departureTime") => {
    const newSortBy = property;
    const newSortDir = sortBy === property && sortDir === "asc" ? "desc" : "asc";
    setSortBy(newSortBy);
    setSortDir(newSortDir);

    if (bookingtype === "flights") {
      setIsSearching(true);
      try {
        const results = await searchflights(from, to, date, travelers, newSortBy, newSortDir);
        setsearchresult(results);
      } catch (err) {
        console.error("Sorting flights failed:", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Date unavailable";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString("en-US", options);
  };

  const handlebooknow = (id: any) => {
    if (bookingtype === "flights") {
      router.push(`/book-flight/${id}`);
    } else {
      router.push(`/book-hotel/${id}`);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80")',
      }}
    >
      <Head>
        <title>MakeMyTour - Flights, Hotels & Holiday Travel Bookings</title>
        <meta
          name="description"
          content="Book flights, hotels, holiday packages and travel reservations at best prices on MakeMyTour."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container mx-auto px-4 py-6">
        <nav className="bg-white rounded-xl shadow-lg mx-auto max-w-5xl mb-6 p-4 overflow-x-auto">
          <div className="flex justify-between items-center min-w-max space-x-8">
            <NavItem
              icon={<Plane />}
              text="Flights"
              active={bookingtype === "flights"}
              onClick={() => {
                setbookingtype("flights");
                setHasSearched(false);
                setSearchError(null);
                setsearchresult(flight);
              }}
            />
            <NavItem
              icon={<Hotel />}
              text="Hotels"
              active={bookingtype === "hotels"}
              onClick={() => {
                setbookingtype("hotels");
                setHasSearched(false);
                setSearchError(null);
                setsearchresult(hotel);
              }}
            />
            <NavItem icon={<HomeIcon />} text="Homestays" />
            <NavItem icon={<Umbrella />} text="Holiday" />
            <NavItem icon={<Train />} text="Trains" />
            <NavItem icon={<Bus />} text="Buses" />
            <NavItem icon={<Car />} text="Cabs" />
            <NavItem icon={<CreditCard />} text="Forex" />
            <NavItem icon={<Shield />} text="Insurance" />
          </div>
        </nav>

        <div className="bg-white rounded-xl shadow-lg mx-auto max-w-5xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {bookingtype === "flights" && (
              <div className="col-span-1">
                <SearchSelect
                  options={cityOptions}
                  placeholder="From"
                  value={from}
                  onChange={setfrom}
                  icon={<MapPin className="text-gray-400" />}
                  subtitle="Enter city or airport"
                />
              </div>
            )}

            <div className="col-span-1">
              <SearchSelect
                options={cityOptions}
                placeholder={bookingtype === "flights" ? "To" : "City"}
                value={to}
                onChange={setto}
                icon={<MapPin className="text-gray-400" />}
                subtitle={
                  bookingtype === "flights"
                    ? "Enter city or airport"
                    : "Enter city"
                }
              />
            </div>

            <div className="col-span-1">
              <SearchInput
                icon={<Calendar className="text-gray-400" />}
                placeholder="Date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setdate(e.target.value)
                }
                subtitle="Select a date"
                type="date"
              />
            </div>

            <div className="col-span-1">
              <SearchInput
                icon={<Users className="text-gray-400" />}
                placeholder="Travelers"
                value={travelers.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value) || 1;
                  settravelers(Math.max(1, Math.min(9, val)));
                }}
                subtitle="Number of travelers (1-9)"
                type="number"
              />
            </div>

            <Button
              className="col-span-1 h-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
              onClick={handlesearch}
              disabled={isSearching}
            >
              {isSearching ? "SEARCHING..." : "SEARCH"}
            </Button>
          </div>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {hasSearched ? "Search Results" : `Featured ${bookingtype === "flights" ? "Flights" : "Hotels"}`}
              </h2>

              {bookingtype === "flights" && searchresults.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500 font-medium">Sort by:</span>
                  <Button
                    size="sm"
                    variant={sortBy === "price" ? "default" : "outline"}
                    className={sortBy === "price" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                    onClick={() => handleSortChange("price")}
                  >
                    Cheapest {sortBy === "price" && (sortDir === "asc" ? "↑" : "↓")}
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === "departureTime" ? "default" : "outline"}
                    className={sortBy === "departureTime" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                    onClick={() => handleSortChange("departureTime")}
                  >
                    Earliest Departure {sortBy === "departureTime" && (sortDir === "asc" ? "↑" : "↓")}
                  </Button>
                </div>
              )}
            </div>

            {isSearching ? (
              <div className="py-12 flex justify-center items-center">
                <Loader />
              </div>
            ) : searchresults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchresults.map((result) => {
                  const seats = Number(result.availableSeats ?? 0);
                  const isSoldOut = seats <= 0;
                  const duration = calculateDuration(result.departureTime, result.arrivalTime);

                  return (
                    <div
                      key={result.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col justify-between"
                    >
                      {bookingtype === "flights" ? (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-900 text-base">
                                {result.flightName}
                              </span>
                              {isSoldOut ? (
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">
                                  Sold Out
                                </span>
                              ) : seats <= 5 ? (
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">
                                  Only {seats} seats left!
                                </span>
                              ) : (
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                                  {seats} seats available
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-700 my-2">
                              <div className="text-left">
                                <p className="font-bold text-gray-900">{result.from}</p>
                                <p className="text-xs text-gray-500">{formatDate(result.departureTime)}</p>
                              </div>
                              <div className="text-center px-2">
                                <span className="text-xs text-gray-500 font-medium">{duration}</span>
                                <div className="w-16 h-0.5 bg-gray-300 relative my-1">
                                  <Plane className="w-3 h-3 text-red-600 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                                </div>
                                <span className="text-[10px] text-gray-400">Non-stop</span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{result.to}</p>
                                <p className="text-xs text-gray-500">{formatDate(result.arrivalTime)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400">Per traveler</p>
                              <p className="text-xl font-black text-gray-900">₹{result.price}</p>
                            </div>
                            <Button
                              className={`px-5 font-semibold ${
                                isSoldOut
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                              disabled={isSoldOut}
                              onClick={() => handlebooknow(result.id)}
                            >
                              {isSoldOut ? "Sold Out" : "Book Now"}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {result.hotelName}
                            </h3>
                            <p className="text-gray-600 text-sm flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                              {result.location}
                            </p>
                            <p className="text-xs text-emerald-600 mt-2 font-medium">
                              {result.availableRooms ?? 10} rooms available
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400">Per night</p>
                              <p className="text-xl font-black text-gray-900">₹{result.pricePerNight}</p>
                            </div>
                            <Button
                              className="bg-red-600 hover:bg-red-700 text-white px-5 font-semibold"
                              onClick={() => handlebooknow(result.id)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center my-4">
                <p className="text-gray-700 font-medium text-lg mb-2">
                  No {bookingtype} found for the selected criteria.
                </p>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                  {bookingtype === "flights"
                    ? `No flights found between "${from || "any origin"}" and "${to || "any destination"}". Try selecting different cities or dates.`
                    : `No hotels found in "${to || "the selected location"}".`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setfrom("");
                    setto("");
                    setdate("");
                    settravelers(1);
                    setsearchresult(bookingtype === "flights" ? flight : hotel);
                    setHasSearched(false);
                    setSearchError(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          {/* Offers Section */}
          <section className="my-16">
            <h2 className="text-2xl font-bold mb-8 text-white">Best Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer, index) => (
                <OfferCard key={index} {...offer} />
              ))}
            </div>
          </section>

          {/* Collections Section */}
          <section className="my-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                Handpicked Collections for You
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collections.map((collection, index) => (
                <CollectionCard key={index} {...collection} />
              ))}
            </div>
          </section>

          {/* Wonders Section */}
          <section className="my-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                Unlock Lesser-Known <span></span> Wonders of India
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wonders.map((wonder, index) => (
                <WonderCard key={index} {...wonder} />
              ))}
            </div>
          </section>

          {/* Download App Section */}
          <DownloadApp />
        </div>
      </main>
    </div>
  );
}
const OfferCard = ({ title, description, imageUrl }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
};

const CollectionCard = ({ title, imageUrl, tag }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
        <div className="absolute top-4 left-4">
          <span className="bg-white text-black text-sm font-semibold px-2 py-1 rounded">
            {tag}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
};
const DownloadApp = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-7xl mx-auto my-12">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-2">Download App Now!</h3>
          <p className="text-gray-600 mb-4">
            Get India's #1 travel super app with best deals on flights
          </p>
          <div className="flex space-x-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="App Store"
              className="h-10"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Play Store"
              className="h-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <QrCode className="w-24 h-24" />
          <p className="text-sm text-gray-600">
            Scan QR code to download the app
          </p>
        </div>
      </div>
    </div>
  );
};

const WonderCard = ({ title, imageUrl }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
};
function NavItem({ icon, text, active = false, onClick }: any) {
  return (
    <button
      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${active ? "text-blue-500" : "text-gray-600 hover:text-blue-500"
        }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm mt-1 whitespace-nowrap">{text}</span>
    </button>
  );
}

function SearchInput({
  icon,
  placeholder,
  value,
  onChange,
  subtitle,
  type = "text",
}: any) {
  return (
    <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer h-full">
      <div className="flex items-center space-x-2">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500 truncate">{placeholder}</div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            className="font-semibold w-full bg-transparent outline-none"
            placeholder={placeholder}
          />
          <div className="text-xs text-gray-400 truncate">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
