package com.makemytrip.makemytrip.cancellationrefund.service;

import com.makemytrip.makemytrip.cancellationrefund.dto.RefundQuoteDTO;
import com.makemytrip.makemytrip.cancellationrefund.model.CancellationReasonEnum;
import com.makemytrip.makemytrip.features.flightstatus.dto.FlightStatusUpdateDTO;
import com.makemytrip.makemytrip.features.flightstatus.model.FlightStatusEnum;
import com.makemytrip.makemytrip.features.flightstatus.service.FlightStatusSimulatorService;
import com.makemytrip.makemytrip.models.Booking;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class RefundPolicyCalculatorService {

    private final FlightStatusSimulatorService flightStatusSimulatorService;

    public RefundPolicyCalculatorService(FlightStatusSimulatorService flightStatusSimulatorService) {
        this.flightStatusSimulatorService = flightStatusSimulatorService;
    }

    /**
     * Computes a deterministic refund quote based on time until travel, quantity to cancel,
     * and optional flight delay waivers.
     */
    public RefundQuoteDTO calculateQuote(Booking booking, Integer requestedQuantity, CancellationReasonEnum reason) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }

        int totalQuantity = (booking.getQuantity() != null && booking.getQuantity() > 0) ? booking.getQuantity() : 1;
        int quantityToCancel = (requestedQuantity != null && requestedQuantity > 0) ? requestedQuantity : totalQuantity;
        if (quantityToCancel > totalQuantity) {
            quantityToCancel = totalQuantity;
        }

        BigDecimal originalTotal = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;

        // Pro-Rata base calculation: (originalTotal / totalQuantity) * quantityToCancel
        BigDecimal unitPortion = originalTotal.divide(BigDecimal.valueOf(totalQuantity), 4, RoundingMode.HALF_UP);
        BigDecimal cancelledPortionAmount = unitPortion.multiply(BigDecimal.valueOf(quantityToCancel))
                .setScale(2, RoundingMode.HALF_UP);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime travelDateTime = resolveTravelDateTime(booking);
        long hoursUntilTravel = (travelDateTime != null) ? Duration.between(now, travelDateTime).toHours() : 0L;

        boolean isDelayedFlightWaiver = false;
        if (reason == CancellationReasonEnum.FLIGHT_DELAY_OR_RESCHEDULE && booking.getFlight() != null) {
            try {
                FlightStatusUpdateDTO status = flightStatusSimulatorService.getStatus(booking.getFlight().getId());
                if (status != null && (status.getStatus() == FlightStatusEnum.DELAYED || status.getDelayMinutes() > 0)) {
                    isDelayedFlightWaiver = true;
                }
            } catch (Exception ignored) {
                // In test or standalone environment where simulator cache is uninitialized
            }
        }

        int refundPercentage;
        String policyLabel;

        if (isDelayedFlightWaiver) {
            refundPercentage = 100;
            policyLabel = "Operational Delay Waiver — 100% Refund";
        } else if (hoursUntilTravel > 168) {
            // More than 7 days (> 168 hours)
            refundPercentage = 90;
            policyLabel = "Early Cancellation Tier (90% Refund)";
        } else if (hoursUntilTravel >= 24) {
            // Between 24 hours and 7 days (24h - 168h)
            refundPercentage = 75;
            policyLabel = "Standard Window Tier (75% Refund)";
        } else {
            // Within 24 hours (< 24h) or post-schedule
            refundPercentage = 50;
            policyLabel = "Within 24-Hour Policy Tier (50% Refund)";
        }

        BigDecimal refundPercentageRatio = BigDecimal.valueOf(refundPercentage).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal netRefundAmount = cancelledPortionAmount.multiply(refundPercentageRatio).setScale(2, RoundingMode.HALF_UP);
        BigDecimal cancellationFee = cancelledPortionAmount.subtract(netRefundAmount).setScale(2, RoundingMode.HALF_UP);

        RefundQuoteDTO quote = new RefundQuoteDTO();
        quote.setBookingId(booking.getId());
        quote.setQuantityToCancel(quantityToCancel);
        quote.setTotalQuantity(totalQuantity);
        quote.setOriginalTotalAmount(originalTotal);
        quote.setCancelledPortionAmount(cancelledPortionAmount);
        quote.setRefundPercentage(refundPercentage);
        quote.setCancellationFee(cancellationFee);
        quote.setNetRefundAmount(netRefundAmount);
        quote.setPolicyAppliedLabel(policyLabel);
        quote.setExpectedTimelineText("Refund initiated instantly. 24–48 hrs processing, 3–5 business days to original payment method.");
        quote.setTravelDateTime(travelDateTime);
        quote.setHoursUntilTravel(hoursUntilTravel);
        quote.setOperationalDelayWaiver(isDelayedFlightWaiver);

        return quote;
    }

    private LocalDateTime resolveTravelDateTime(Booking booking) {
        if (booking.getFlight() != null && booking.getFlight().getDepartureTime() != null) {
            return booking.getFlight().getDepartureTime();
        }
        if (booking.getCheckInDate() != null) {
            return booking.getCheckInDate().atStartOfDay();
        }
        return null;
    }
}
