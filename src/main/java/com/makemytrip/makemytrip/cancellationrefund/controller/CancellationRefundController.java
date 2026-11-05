package com.makemytrip.makemytrip.cancellationrefund.controller;

import com.makemytrip.makemytrip.cancellationrefund.dto.CancelBookingRequestDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.CancellationRefundTrackerDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.CancellationTrendStatsDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.RefundQuoteDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.RefundStatusUpdateRequestDTO;
import com.makemytrip.makemytrip.cancellationrefund.model.CancellationReasonEnum;
import com.makemytrip.makemytrip.cancellationrefund.service.BookingCancellationService;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cancellations")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CancellationRefundController {

    private final BookingCancellationService bookingCancellationService;

    public CancellationRefundController(BookingCancellationService bookingCancellationService) {
        this.bookingCancellationService = bookingCancellationService;
    }

    /**
     * Preview refund quote before confirming cancellation.
     */
    @GetMapping("/quote/{bookingId}")
    public ResponseEntity<RefundQuoteDTO> getQuote(
            @PathVariable Long bookingId,
            @RequestParam(required = false) Integer quantityToCancel,
            @RequestParam(required = false) CancellationReasonEnum reason) {
        RefundQuoteDTO quote = bookingCancellationService.getQuote(bookingId, quantityToCancel, reason);
        return ResponseEntity.ok(quote);
    }

    /**
     * Execute full or partial booking cancellation.
     */
    @PostMapping("/cancel")
    public ResponseEntity<CancellationRefundTrackerDTO> cancelBooking(
            @Valid @RequestBody CancelBookingRequestDTO request,
            Authentication authentication) {
        String authEmail = (authentication != null) ? authentication.getName() : null;
        CancellationRefundTrackerDTO result = bookingCancellationService.executeCancellation(request, authEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * Get all cancellations for a given user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CancellationRefundTrackerDTO>> getUserCancellations(
            @PathVariable Long userId,
            Authentication authentication) {
        String authEmail = (authentication != null) ? authentication.getName() : null;
        List<CancellationRefundTrackerDTO> list = bookingCancellationService.getUserCancellations(userId, authEmail);
        return ResponseEntity.ok(list);
    }

    /**
     * Get latest cancellation tracker for a specific booking.
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<CancellationRefundTrackerDTO> getCancellationByBookingId(
            @PathVariable Long bookingId) {
        return bookingCancellationService.getCancellationByBookingId(bookingId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("No cancellation found for booking ID: " + bookingId));
    }

    /**
     * Admin: Progress refund status (PENDING -> PROCESSED -> COMPLETED).
     */
    @PatchMapping("/{cancellationId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CancellationRefundTrackerDTO> updateRefundStatus(
            @PathVariable Long cancellationId,
            @Valid @RequestBody RefundStatusUpdateRequestDTO request) {
        CancellationRefundTrackerDTO updated = bookingCancellationService.updateRefundStatus(
                cancellationId, request.getNewStatus());
        return ResponseEntity.ok(updated);
    }

    /**
     * Admin: Get cancellation reason distribution analytics.
     */
    @GetMapping("/analytics/reasons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CancellationTrendStatsDTO> getReasonAnalytics() {
        CancellationTrendStatsDTO stats = bookingCancellationService.getReasonAnalytics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Admin: List all cancellations in descending chronological order.
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CancellationRefundTrackerDTO>> getAllCancellations() {
        List<CancellationRefundTrackerDTO> list = bookingCancellationService.getAllCancellations();
        return ResponseEntity.ok(list);
    }
}

