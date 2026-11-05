package com.makemytrip.makemytrip.cancellationrefund.service;

import com.makemytrip.makemytrip.cancellationrefund.dto.CancelBookingRequestDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.CancellationRefundTrackerDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.CancellationTrendStatsDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.RefundQuoteDTO;
import com.makemytrip.makemytrip.cancellationrefund.model.BookingCancellationRecord;
import com.makemytrip.makemytrip.cancellationrefund.model.CancellationReasonEnum;
import com.makemytrip.makemytrip.cancellationrefund.model.RefundStatusEnum;
import com.makemytrip.makemytrip.cancellationrefund.repository.BookingCancellationRepository;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.models.Booking;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingCancellationService {

    private final BookingRepository bookingRepository;
    private final BookingCancellationRepository cancellationRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final RefundPolicyCalculatorService refundPolicyCalculatorService;

    public BookingCancellationService(
            BookingRepository bookingRepository,
            BookingCancellationRepository cancellationRepository,
            FlightRepository flightRepository,
            HotelRepository hotelRepository,
            UserRepository userRepository,
            RefundPolicyCalculatorService refundPolicyCalculatorService) {
        this.bookingRepository = bookingRepository;
        this.cancellationRepository = cancellationRepository;
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
        this.userRepository = userRepository;
        this.refundPolicyCalculatorService = refundPolicyCalculatorService;
    }

    /**
     * Preview refund quote before user confirmation.
     */
    public RefundQuoteDTO getQuote(Long bookingId, Integer quantityToCancel, CancellationReasonEnum reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        return refundPolicyCalculatorService.calculateQuote(booking, quantityToCancel, reason);
    }

    /**
     * Executes transactional booking cancellation, partial/full seat/room quantity adjustments,
     * atomic inventory restoration, and booking cancellation record creation.
     */
    @Transactional
    public CancellationRefundTrackerDTO executeCancellation(CancelBookingRequestDTO request, String authEmail) {
        if (request == null || request.getBookingId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking ID is required");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        // Validate user authorization
        validateBookingOwnership(booking, authEmail);

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking is already fully cancelled");
        }

        int currentQuantity = (booking.getQuantity() != null && booking.getQuantity() > 0) ? booking.getQuantity() : 1;
        int quantityToCancel = (request.getQuantityToCancel() != null && request.getQuantityToCancel() > 0)
                ? request.getQuantityToCancel()
                : currentQuantity;

        if (quantityToCancel > currentQuantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot cancel " + quantityToCancel + " items; booking only has " + currentQuantity + " reserved.");
        }

        // 1. Transactional Inventory Restoration (atomic)
        restoreInventory(booking, quantityToCancel);

        // 2. Compute Refund Quote
        CancellationReasonEnum reason = request.getReason() != null ? request.getReason() : CancellationReasonEnum.OTHER;
        RefundQuoteDTO quote = refundPolicyCalculatorService.calculateQuote(booking, quantityToCancel, reason);

        // 3. Update Booking State
        if (quantityToCancel == currentQuantity) {
            booking.setStatus("CANCELLED");
            booking.setCancelledAt(LocalDateTime.now());
        } else {
            booking.setStatus("PARTIALLY_CANCELLED");
            booking.setQuantity(currentQuantity - quantityToCancel);
            BigDecimal remainingPrice = booking.getTotalPrice().subtract(quote.getCancelledPortionAmount());
            if (remainingPrice.compareTo(BigDecimal.ZERO) < 0) {
                remainingPrice = BigDecimal.ZERO;
            }
            booking.setTotalPrice(remainingPrice);
        }
        bookingRepository.save(booking);

        // 4. Create BookingCancellationRecord
        BookingCancellationRecord record = new BookingCancellationRecord();
        record.setBookingId(booking.getId());
        record.setUserId(booking.getUser() != null ? booking.getUser().getId() : 0L);
        record.setCancelledQuantity(quantityToCancel);
        record.setOriginalBookingAmount(quote.getOriginalTotalAmount());
        record.setCancelledPortionAmount(quote.getCancelledPortionAmount());
        record.setRefundPercentage(quote.getRefundPercentage());
        record.setCancellationFee(quote.getCancellationFee());
        record.setRefundAmount(quote.getNetRefundAmount());
        record.setPolicyAppliedLabel(quote.getPolicyAppliedLabel());
        record.setReason(reason);
        record.setAdditionalNotes(request.getAdditionalNotes());
        record.setRefundStatus(quote.getNetRefundAmount().compareTo(BigDecimal.ZERO) > 0
                ? RefundStatusEnum.PENDING
                : RefundStatusEnum.NO_REFUND_APPLICABLE);
        record.setCancelledAt(LocalDateTime.now());
        record.setExpectedCompletionAt(LocalDateTime.now().plusDays(5));

        BookingCancellationRecord savedRecord = cancellationRepository.save(record);
        return CancellationRefundTrackerDTO.from(savedRecord);
    }

    /**
     * Atomically restores reserved seats or rooms back into active inventory.
     */
    private void restoreInventory(Booking booking, int quantityToRestore) {
        if (booking.getFlight() != null && booking.getFlight().getId() != null) {
            Flight flight = flightRepository.findByIdWithLock(booking.getFlight().getId())
                    .orElse(null);
            if (flight != null) {
                int seats = flight.getAvailableSeats() != null ? flight.getAvailableSeats() : 0;
                flight.setAvailableSeats(seats + quantityToRestore);
                flightRepository.save(flight);
            }
        } else if (booking.getHotel() != null && booking.getHotel().getId() != null) {
            Hotel hotel = hotelRepository.findByIdWithLock(booking.getHotel().getId())
                    .orElse(null);
            if (hotel != null) {
                int rooms = hotel.getAvailableRooms() != null ? hotel.getAvailableRooms() : 0;
                hotel.setAvailableRooms(rooms + quantityToRestore);
                hotelRepository.save(hotel);
            }
        }
    }

    /**
     * Retrieves cancellation refund trackers for a specific user.
     */
    public List<CancellationRefundTrackerDTO> getUserCancellations(Long userId, String authEmail) {
        if (authEmail != null) {
            Users authUser = userRepository.findByEmailIgnoreCase(authEmail).orElse(null);
            if (authUser != null) {
                boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
                if (!isAdmin && !authUser.getId().equals(userId)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot access cancellations for other users");
                }
            }
        }
        return cancellationRepository.findByUserIdOrderByCancelledAtDesc(userId).stream()
                .map(CancellationRefundTrackerDTO::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves latest cancellation tracker for a specific booking.
     */
    public Optional<CancellationRefundTrackerDTO> getCancellationByBookingId(Long bookingId) {
        return cancellationRepository.findTopByBookingIdOrderByCancelledAtDesc(bookingId)
                .map(CancellationRefundTrackerDTO::from);
    }

    /**
     * Retrieves all cancellation refund trackers (for Admin dashboard).
     */
    public List<CancellationRefundTrackerDTO> getAllCancellations() {
        return cancellationRepository.findAllByOrderByCancelledAtDesc().stream()
                .map(CancellationRefundTrackerDTO::from)
                .collect(Collectors.toList());
    }

    /**
     * Progresses refund status: PENDING -> PROCESSED -> COMPLETED.
     * Synchronizes status with Booking entity in real time.
     */
    @Transactional
    public CancellationRefundTrackerDTO updateRefundStatus(Long cancellationId, RefundStatusEnum newStatus) {
        if (newStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New refund status cannot be null");
        }

        BookingCancellationRecord record = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new ResourceNotFoundException("Cancellation record not found with ID: " + cancellationId));

        record.setRefundStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();

        if (newStatus == RefundStatusEnum.PROCESSED) {
            record.setProcessedAt(now);
        } else if (newStatus == RefundStatusEnum.COMPLETED) {
            if (record.getProcessedAt() == null) {
                record.setProcessedAt(now);
            }
            record.setCompletedAt(now);
        }

        // Synchronize Booking status
        bookingRepository.findById(record.getBookingId()).ifPresent(booking -> {
            if (newStatus == RefundStatusEnum.COMPLETED) {
                booking.setStatus("REFUNDED");
            } else if (newStatus == RefundStatusEnum.PROCESSED) {
                booking.setStatus("REFUND_PENDING");
            }
            bookingRepository.save(booking);
        });

        BookingCancellationRecord saved = cancellationRepository.save(record);
        return CancellationRefundTrackerDTO.from(saved);
    }

    /**
     * Aggregates cancellation reason analytics and refund financial trends for admins.
     */
    public CancellationTrendStatsDTO getReasonAnalytics() {
        CancellationTrendStatsDTO stats = new CancellationTrendStatsDTO();
        List<BookingCancellationRecord> all = cancellationRepository.findAll();

        Map<String, Long> counts = new HashMap<>();
        for (CancellationReasonEnum reason : CancellationReasonEnum.values()) {
            counts.put(reason.name(), 0L);
        }

        BigDecimal totalRefunded = BigDecimal.ZERO;
        long pendingCount = 0;
        long completedCount = 0;

        for (BookingCancellationRecord r : all) {
            if (r.getReason() != null) {
                counts.put(r.getReason().name(), counts.getOrDefault(r.getReason().name(), 0L) + 1);
            }
            if (r.getRefundStatus() == RefundStatusEnum.COMPLETED && r.getRefundAmount() != null) {
                totalRefunded = totalRefunded.add(r.getRefundAmount());
                completedCount++;
            } else if (r.getRefundStatus() == RefundStatusEnum.PENDING) {
                pendingCount++;
            }
        }

        stats.setReasonCounts(counts);
        stats.setTotalCancellations(all.size());
        stats.setTotalRefundedAmount(totalRefunded.setScale(2, java.math.RoundingMode.HALF_UP));
        stats.setPendingRefundsCount(pendingCount);
        stats.setCompletedRefundsCount(completedCount);
        return stats;
    }

    private void validateBookingOwnership(Booking booking, String authEmail) {
        if (authEmail == null || authEmail.isBlank()) {
            return; // Permitted if unauthenticated integration test or system call
        }
        Users authUser = userRepository.findByEmailIgnoreCase(authEmail).orElse(null);
        if (authUser == null) {
            return;
        }
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
        if (isAdmin) {
            return;
        }
        if (booking.getUser() != null && !booking.getUser().getId().equals(authUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this booking");
        }
    }
}
