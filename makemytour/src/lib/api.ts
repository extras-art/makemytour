/**
 * @deprecated Use `@/api` directly. This file exists only for backward
 * compatibility with any imports pointing at `@/lib/api`.
 */
export { default } from "@/api/index";
export {
  signup as registerUser,
  getflight as getFlights,
  searchflights as searchFlights,
  gethotel as getHotels,
  searchhotels as searchHotels,
  handleflightbooking as createBooking,
  getuserbookings as getBookings,
} from "@/api/index";
