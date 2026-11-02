import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4040",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept 401 Unauthorized responses to clear expired credentials
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/api/users/login") || url.includes("/api/users/register");
      if (!isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a clean error message from Axios errors.
 * Avoids crashes from unstructured backend responses.
 */
const extractErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.response?.status === 401) return "Unauthorized — invalid email or password.";
    if (error.response?.status === 403) return "Forbidden — insufficient permissions.";
    if (error.response?.status === 409) return "Email is already registered.";
    if (error.response?.status === 429) return "Too many requests — please try again later.";
    return error.message || "An unexpected error occurred.";
  }
  return error?.message || "An unexpected error occurred.";
};

// -------------------- USER APIs --------------------

export const signup = async (
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  password: string
) => {
  try {
    const res = await api.post("/api/users/register", {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone: phoneNumber,
      password,
    });
    if (res.data?.token && typeof window !== "undefined") {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const login = async (email: string, password: string) => {
  try {
    const res = await api.post("/api/users/login", { email, password });
    if (res.data?.token && typeof window !== "undefined") {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const logout = async () => {
  try {
    await api.post("/api/users/logout");
  } catch (error) {
    // Ignore error on logout endpoint
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
};

export const getcurrentuser = async () => {
  try {
    const res = await api.get("/api/users/me");
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getuserbyemail = async (email: string) => {
  try {
    const res = await api.get("/api/users");
    return res.data.find(
      (user: any) => user.email?.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const editprofile = async (
  userId: number | string,
  payload: { name: string; phone?: string }
) => {
  try {
    const res = await api.put(`/api/users/${userId}`, payload);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};


// -------------------- FLIGHT APIs --------------------

export const getflight = async () => {
  try {
    const res = await api.get("/api/flights");
    return res.data.map((flight: any) => ({
      ...flight,
      flightName: flight.airline ?? flight.flightName ?? "",
      from: flight.source ?? flight.from ?? "",
      to: flight.destination ?? flight.to ?? "",
    }));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getflightbyid = async (id: number | string) => {
  try {
    const res = await api.get(`/api/flights/${id}`);
    const flight = res.data;
    return {
      ...flight,
      flightName: flight.airline ?? flight.flightName ?? "",
      from: flight.source ?? flight.from ?? "",
      to: flight.destination ?? flight.to ?? "",
    };
  } catch (error) {
    // Fallback: fetch all and filter (until GET /api/flights/{id} is implemented)
    const allFlights = await getflight();
    const found = allFlights.find((f: any) => String(f.id) === String(id));
    if (!found) throw new Error("Flight not found.");
    return found;
  }
};

export const searchflights = async (
  source?: string,
  destination?: string,
  date?: string,
  passengers: number = 1,
  sortBy: string = "price",
  sortDir: string = "asc"
) => {
  try {
    const params: Record<string, any> = { passengers, sortBy, sortDir };
    if (source && source.trim()) params.source = source.trim();
    if (destination && destination.trim()) params.destination = destination.trim();
    if (date && date.trim()) params.date = date.trim();

    const res = await api.get("/api/flights/search", { params });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    return rawList.map((flight: any) => ({
      ...flight,
      flightName: flight.airline ?? flight.flightName ?? "",
      from: flight.source ?? flight.from ?? "",
      to: flight.destination ?? flight.to ?? "",
    }));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const addflight = async (
  flightName: string,
  from: string,
  to: string,
  departureTime: string,
  arrivalTime: string,
  price: number,
  availableSeats: number
) => {
  try {
    const res = await api.post("/api/flights", {
      airline: flightName,
      source: from,
      destination: to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const editflight = async (
  id: number | string,
  flightData: {
    airline?: string;
    flightName?: string;
    source?: string;
    from?: string;
    destination?: string;
    to?: string;
    departureTime?: string;
    arrivalTime?: string;
    price?: number;
    availableSeats?: number;
    active?: boolean;
  }
) => {
  try {
    const payload: any = { ...flightData };
    if (flightData.flightName) payload.airline = flightData.flightName;
    if (flightData.from) payload.source = flightData.from;
    if (flightData.to) payload.destination = flightData.to;

    const res = await api.put(`/api/flights/${id}`, payload);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const deactivateflight = async (id: number | string) => {
  try {
    const res = await api.patch(`/api/flights/${id}/deactivate`);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getallflightsadmin = async () => {
  try {
    const res = await api.get("/api/admin/flights");
    return res.data.map((flight: any) => ({
      ...flight,
      flightName: flight.airline ?? flight.flightName ?? "",
      from: flight.source ?? flight.from ?? "",
      to: flight.destination ?? flight.to ?? "",
      price: Number(flight.price ?? 0),
      availableSeats: Number(flight.availableSeats ?? 0),
    }));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// -------------------- HOTEL APIs --------------------

export const gethotel = async () => {
  try {
    const res = await api.get("/api/hotels");
    return res.data.map((hotel: any) => ({
      ...hotel,
      hotelName: hotel.name ?? hotel.hotelName ?? "",
      location: hotel.city ?? hotel.location ?? "",
      pricePerNight: Number(hotel.pricePerNight ?? 0),
    }));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const gethotelbyid = async (id: number | string) => {
  try {
    const res = await api.get(`/api/hotels/${id}`);
    const hotel = res.data;
    return {
      ...hotel,
      hotelName: hotel.name ?? hotel.hotelName ?? "",
      location: hotel.city ?? hotel.location ?? "",
      pricePerNight: Number(hotel.pricePerNight ?? 0),
    };
  } catch (error) {
    // Fallback: fetch all and filter (until GET /api/hotels/{id} is implemented)
    const allHotels = await gethotel();
    const found = allHotels.find((h: any) => String(h.id) === String(id));
    if (!found) throw new Error("Hotel not found.");
    return found;
  }
};

export const searchhotels = async (
  city?: string,
  rooms: number = 1,
  minRating?: number,
  sortBy: string = "pricePerNight",
  sortDir: string = "asc"
) => {
  try {
    const params: Record<string, any> = { rooms, sortBy, sortDir };
    if (city && city.trim()) params.city = city.trim();
    if (minRating) params.minRating = minRating;

    const res = await api.get("/api/hotels/search", { params });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    return rawList.map((hotel: any) => ({
      ...hotel,
      hotelName: hotel.name ?? hotel.hotelName ?? "",
      location: hotel.city ?? hotel.location ?? "",
      pricePerNight: Number(hotel.pricePerNight ?? 0),
    }));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const addhotel = async (
  hotelName: string,
  location: string,
  pricePerNight: number,
  availableRooms: number,
  amenities: any = []
) => {
  try {
    const res = await api.post("/api/hotels", {
      name: hotelName,
      city: location,
      address: location,
      pricePerNight,
      availableRooms,
      starRating: 3,
    });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const edithotel = async (
  id: number | string,
  hotelData: {
    name?: string;
    hotelName?: string;
    city?: string;
    location?: string;
    address?: string;
    pricePerNight?: number;
    availableRooms?: number;
    starRating?: number;
    active?: boolean;
  }
) => {
  try {
    const payload: any = { ...hotelData };
    if (hotelData.hotelName) payload.name = hotelData.hotelName;
    if (hotelData.location) payload.city = hotelData.location;

    const res = await api.put(`/api/hotels/${id}`, payload);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const deactivatehotel = async (id: number | string) => {
  try {
    const res = await api.patch(`/api/hotels/${id}/deactivate`);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getallhotelsadmin = async () => {
  try {
    const res = await api.get("/api/admin/hotels");
    return res.data.map((hotel: any) => ({
      ...hotel,
      hotelName: hotel.name ?? hotel.hotelName ?? "",
      location: hotel.city ?? hotel.location ?? "",
      pricePerNight: Number(hotel.pricePerNight ?? 0),
      availableRooms: Number(hotel.availableRooms ?? 0),
    }));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getauditlogs = async () => {
  try {
    const res = await api.get("/api/admin/audit-logs");
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getallbookingsadmin = async () => {
  try {
    const res = await api.get("/api/bookings");
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// -------------------- BOOKING APIs --------------------

export const handleflightbooking = async (
  userId: number | string,
  flightId: number | string,
  quantity: number = 1,
  _price?: number,
  idempotencyKey?: string
) => {
  try {
    const payload: Record<string, any> = {
      userId: Number(userId),
      flightId: Number(flightId),
      quantity: Math.max(1, Number(quantity) || 1),
    };
    if (idempotencyKey) {
      payload.idempotencyKey = idempotencyKey;
    }
    const res = await api.post("/api/bookings", payload);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const handlehotelbooking = async (
  userId: number | string,
  hotelId: number | string,
  quantity: number = 1,
  _price?: number,
  checkInDate?: string,
  checkOutDate?: string,
  idempotencyKey?: string
) => {
  try {
    const payload: Record<string, any> = {
      userId: Number(userId),
      hotelId: Number(hotelId),
      quantity: Math.max(1, Number(quantity) || 1),
    };
    if (checkInDate) payload.checkInDate = checkInDate;
    if (checkOutDate) payload.checkOutDate = checkOutDate;
    if (idempotencyKey) payload.idempotencyKey = idempotencyKey;

    const res = await api.post("/api/bookings", payload);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getuserbookings = async (userId: number | string) => {
  try {
    const res = await api.get(`/api/bookings/user/${userId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    // Fallback: fetch all bookings and filter by userId
    try {
      const fallbackRes = await api.get("/api/bookings");
      return (fallbackRes.data || []).filter(
        (b: any) => String(b.user?.id) === String(userId)
      );
    } catch {
      return [];
    }
  }
};

export const cancelbooking = async (bookingId: number | string) => {
  try {
    const res = await api.patch(`/api/bookings/${bookingId}/cancel`);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export default api;
