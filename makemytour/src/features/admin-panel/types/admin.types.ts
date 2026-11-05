// Admin Panel Type Definitions

export interface AdminOverviewStats {
  totalUsers: number;
  totalFlights: number;
  activeFlights: number;
  inactiveFlights: number;
  totalHotels: number;
  activeHotels: number;
  inactiveHotels: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  refundPendingBookings: number;
  refundedBookings: number;
  recentRegistrations: AdminUser[];
  recentBookings: BookingSummary[];
  lastInventorySummary: any;
}

export interface BookingSummary {
  id: number;
  customerName: string;
  customerEmail: string;
  type: "FLIGHT" | "HOTEL";
  entityName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  bookings: AdminBooking[];
}

export interface AdminBooking {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  type: "FLIGHT" | "HOTEL";
  entityId: number;
  entityName: string;
  quantity: number;
  nights: number;
  checkInDate?: string;
  checkOutDate?: string;
  unitPriceSnapshot: number;
  taxesAndFees: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  cancelledAt?: string;
}

export interface AdminFlight {
  id: number;
  airline: string;
  source: string;
  destination: string;
  departureTime?: string;
  arrivalTime?: string;
  price: number;
  availableSeats: number;
  active: boolean;
  bookingCount: number;
  hasActiveBookings: boolean;
}

export interface AdminHotel {
  id: number;
  name: string;
  city: string;
  address?: string;
  availableRooms: number;
  starRating?: number;
  pricePerNight: number;
  active: boolean;
  bookingCount: number;
  hasActiveBookings: boolean;
}

export interface AdminAuditLog {
  id: number;
  timestamp: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export type AdminTab =
  | "overview"
  | "users"
  | "flights"
  | "hotels"
  | "bookings"
  | "inventory"
  | "pricing"
  | "audit";

