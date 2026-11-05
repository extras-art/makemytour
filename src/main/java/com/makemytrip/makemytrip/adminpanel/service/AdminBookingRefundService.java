package com.makemytrip.makemytrip.adminpanel.service;

import com.makemytrip.makemytrip.adminpanel.dto.AdminBookingDTO;
import com.makemytrip.makemytrip.adminpanel.dto.BookingRefundUpdateDTO;
import com.makemytrip.makemytrip.cancellationrefund.model.RefundStatusEnum;
import com.makemytrip.makemytrip.cancellationrefund.repository.BookingCancellationRepository;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.models.Booking;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminBookingRefundService {

    private static final Set<String> VALID_STATUSES = Set.of("CONFIRMED", "CANCELLED", "REFUND_PENDING", "REFUNDED");

    private final BookingRepository bookingRepository;
    private final BookingCancellationRepository cancellationRepository;

    public AdminBookingRefundService(BookingRepository bookingRepository,
                                     BookingCancellationRepository cancellationRepository) {
        this.bookingRepository = bookingRepository;
        this.cancellationRepository = cancellationRepository;
    }

    public List<AdminBookingDTO> listBookings(String status) {
        List<Booking> all = bookingRepository.findAll();
        return all.stream()
            .filter(b -> {
                if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                    return status.equalsIgnoreCase(b.getStatus());
                }
                return true;
            })
            .sorted((a, b) -> {
                if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                if (a.getCreatedAt() == null) return 1;
                if (b.getCreatedAt() == null) return -1;
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            })
            .map(AdminBookingDTO::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public AdminBookingDTO updateBookingStatus(Long bookingId, BookingRefundUpdateDTO dto) {
        if (dto.getNewStatus() == null || !VALID_STATUSES.contains(dto.getNewStatus().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid status. Must be one of: CONFIRMED, CANCELLED, REFUND_PENDING, REFUNDED");
        }

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        String newStatus = dto.getNewStatus().toUpperCase();
        booking.setStatus(newStatus);

        // If transitioning to REFUNDED or CANCELLED, set cancelledAt
        if ("CANCELLED".equals(newStatus) || "REFUNDED".equals(newStatus)) {
            if (booking.getCancelledAt() == null) {
                booking.setCancelledAt(LocalDateTime.now());
            }
        }

        // Synchronize with BookingCancellationRecord if present
        if ("REFUNDED".equals(newStatus)) {
            cancellationRepository.findTopByBookingIdOrderByCancelledAtDesc(bookingId).ifPresent(c -> {
                c.setRefundStatus(RefundStatusEnum.COMPLETED);
                c.setCompletedAt(LocalDateTime.now());
                cancellationRepository.save(c);
            });
        } else if ("REFUND_PENDING".equals(newStatus)) {
            cancellationRepository.findTopByBookingIdOrderByCancelledAtDesc(bookingId).ifPresent(c -> {
                c.setRefundStatus(RefundStatusEnum.PROCESSED);
                c.setProcessedAt(LocalDateTime.now());
                cancellationRepository.save(c);
            });
        }

        Booking saved = bookingRepository.save(booking);
        return AdminBookingDTO.from(saved);
    }
}

