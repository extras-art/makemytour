export type CancellationReason =
  | "CHANGE_OF_PLANS"
  | "FOUND_BETTER_PRICE"
  | "FLIGHT_DELAY_OR_RESCHEDULE"
  | "MEDICAL_EMERGENCY"
  | "BOOKED_BY_MISTAKE"
  | "VISA_OR_DOCUMENT_ISSUE"
  | "OTHER";

export const CANCELLATION_REASONS: { value: CancellationReason; label: string }[] = [
  { value: "CHANGE_OF_PLANS", label: "Change of travel plans" },
  { value: "FOUND_BETTER_PRICE", label: "Found a better price / alternative" },
  { value: "FLIGHT_DELAY_OR_RESCHEDULE", label: "Flight delay or schedule change" },
  { value: "MEDICAL_EMERGENCY", label: "Medical or family emergency" },
  { value: "BOOKED_BY_MISTAKE", label: "Booked by mistake / wrong dates" },
  { value: "VISA_OR_DOCUMENT_ISSUE", label: "Visa or travel documentation issue" },
  { value: "OTHER", label: "Other personal reason" },
];

export type RefundStatus =
  | "PENDING"
  | "PROCESSED"
  | "COMPLETED"
  | "NO_REFUND_APPLICABLE";

export interface RefundQuote {
  bookingId: number;
  quantityToCancel: number;
  totalQuantity: number;
  originalTotalAmount: number;
  cancelledPortionAmount: number;
  refundPercentage: number;
  cancellationFee: number;
  netRefundAmount: number;
  policyAppliedLabel: string;
  expectedTimelineText: string;
  travelDateTime?: string;
  hoursUntilTravel?: number;
  operationalDelayWaiver?: boolean;
}

export interface CancelBookingPayload {
  bookingId: number;
  quantityToCancel?: number;
  reason: CancellationReason;
  additionalNotes?: string;
}

export interface CancellationRefundTracker {
  id: number;
  bookingId: number;
  userId: number;
  cancelledQuantity: number;
  originalBookingAmount: number;
  cancelledPortionAmount: number;
  refundPercentage: number;
  cancellationFee: number;
  refundAmount: number;
  policyAppliedLabel: string;
  reason: CancellationReason;
  reasonLabel: string;
  additionalNotes?: string;
  refundStatus: RefundStatus;
  expectedCompletionAt?: string;
  cancelledAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface CancellationTrendStats {
  reasonCounts: Record<string, number>;
  totalCancellations: number;
  totalRefundedAmount: number;
  pendingRefundsCount: number;
  completedRefundsCount: number;
}

