import api from "@/api";
import type {
  CancelBookingPayload,
  CancellationRefundTracker,
  CancellationTrendStats,
  RefundQuote,
  RefundStatus,
} from "../types/cancellation.types";

const extractError = (err: any): string => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return err?.message || "An unexpected error occurred.";
};

/**
 * Fetch a deterministic refund quote before cancellation confirmation.
 */
export const getRefundQuote = async (
  bookingId: number,
  quantityToCancel?: number,
  reason?: string
): Promise<RefundQuote> => {
  try {
    const params: Record<string, any> = {};
    if (quantityToCancel !== undefined) params.quantityToCancel = quantityToCancel;
    if (reason) params.reason = reason;

    const res = await api.get(`/api/cancellations/quote/${bookingId}`, { params });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Executes full or partial cancellation.
 */
export const cancelBooking = async (
  payload: CancelBookingPayload
): Promise<CancellationRefundTracker> => {
  try {
    const res = await api.post("/api/cancellations/cancel", payload);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Retrieves all cancellation/refund records for a user.
 */
export const getUserCancellations = async (
  userId: number
): Promise<CancellationRefundTracker[]> => {
  try {
    const res = await api.get(`/api/cancellations/user/${userId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Retrieves latest cancellation tracker for a specific booking.
 */
export const getBookingCancellation = async (
  bookingId: number
): Promise<CancellationRefundTracker | null> => {
  try {
    const res = await api.get(`/api/cancellations/booking/${bookingId}`);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw new Error(extractError(err));
  }
};

/**
 * Admin: Update refund status progression (PENDING -> PROCESSED -> COMPLETED).
 */
export const updateRefundStatus = async (
  cancellationId: number,
  newStatus: RefundStatus
): Promise<CancellationRefundTracker> => {
  try {
    const res = await api.patch(`/api/cancellations/${cancellationId}/status`, {
      newStatus,
    });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Admin: Retrieve cancellation reason distribution statistics.
 */
export const getCancellationReasonAnalytics = async (): Promise<CancellationTrendStats> => {
  try {
    const res = await api.get("/api/cancellations/analytics/reasons");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Admin: Retrieve all cancellations.
 */
export const getAllCancellations = async (): Promise<CancellationRefundTracker[]> => {
  try {
    const res = await api.get("/api/cancellations/all");
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

