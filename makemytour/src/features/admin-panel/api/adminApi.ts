import api from "@/api";
import type {
  AdminOverviewStats,
  AdminUser,
  AdminUserDetail,
  AdminBooking,
  AdminFlight,
  AdminHotel,
  AdminAuditLog,
} from "../types/admin.types";

const extractError = (err: any): string => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return err?.message || "An unexpected error occurred.";
};

// ===== OVERVIEW =====
export const getAdminOverview = async (): Promise<AdminOverviewStats> => {
  try {
    const res = await api.get("/api/admin-panel/overview");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// ===== USERS =====
export const getAdminUsers = async (
  search?: string,
  role?: string
): Promise<AdminUser[]> => {
  try {
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (role) params.role = role;
    const res = await api.get("/api/admin-panel/users", { params });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const getAdminUserDetail = async (
  userId: number
): Promise<AdminUserDetail> => {
  try {
    const res = await api.get(`/api/admin-panel/users/${userId}/details`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const updateAdminUserRole = async (
  userId: number,
  role: string
): Promise<AdminUser> => {
  try {
    const res = await api.patch(`/api/admin-panel/users/${userId}/role`, {
      role,
    });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// ===== FLIGHTS =====
export const getAdminFlights = async (): Promise<AdminFlight[]> => {
  try {
    const res = await api.get("/api/admin-panel/flights");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const createAdminFlight = async (
  data: Partial<AdminFlight>
): Promise<AdminFlight> => {
  try {
    const res = await api.post("/api/admin-panel/flights", data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const updateAdminFlight = async (
  id: number,
  data: Partial<AdminFlight> & { forceScheduleUpdate?: boolean }
): Promise<AdminFlight> => {
  try {
    const res = await api.put(`/api/admin-panel/flights/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const deleteAdminFlight = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await api.delete(`/api/admin-panel/flights/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// ===== HOTELS =====
export const getAdminHotels = async (): Promise<AdminHotel[]> => {
  try {
    const res = await api.get("/api/admin-panel/hotels");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const createAdminHotel = async (
  data: Partial<AdminHotel> & { imageUrl?: string }
): Promise<AdminHotel> => {
  try {
    const res = await api.post("/api/admin-panel/hotels", data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const updateAdminHotel = async (
  id: number,
  data: Partial<AdminHotel> & { imageUrl?: string }
): Promise<AdminHotel> => {
  try {
    const res = await api.put(`/api/admin-panel/hotels/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const deleteAdminHotel = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await api.delete(`/api/admin-panel/hotels/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// ===== BOOKINGS =====
export const getAdminBookings = async (
  status?: string
): Promise<AdminBooking[]> => {
  try {
    const params: Record<string, any> = {};
    if (status) params.status = status;
    const res = await api.get("/api/admin-panel/bookings", { params });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const updateBookingStatus = async (
  bookingId: number,
  newStatus: string
): Promise<AdminBooking> => {
  try {
    const res = await api.patch(
      `/api/admin-panel/bookings/${bookingId}/status`,
      { newStatus }
    );
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// ===== AUDIT LOGS =====
export const getAdminAuditLogs = async (): Promise<AdminAuditLog[]> => {
  try {
    const res = await api.get("/api/admin-panel/audit-logs");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// ===== INVENTORY AUTOMATION (re-exports to existing endpoint) =====
export const triggerInventoryRefresh = async () => {
  try {
    const res = await api.post("/api/admin/inventory-refresh/run");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const getInventoryRefreshStatus = async () => {
  try {
    const res = await api.get("/api/admin/inventory-refresh/status");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

