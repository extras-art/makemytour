package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.dto.CreateBookingRequestDto;
import com.makemytrip.makemytrip.models.Booking;
import com.makemytrip.makemytrip.services.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
        @Valid @RequestBody CreateBookingRequestDto request,
        Authentication authentication
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        Booking booking = bookingService.createBooking(request, authEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(
        @PathVariable Long userId,
        Authentication authentication
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(bookingService.getBookingsForUser(userId, authEmail));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(
        @PathVariable Long bookingId,
        Authentication authentication
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        bookingService.cancelBooking(bookingId, authEmail);
        return ResponseEntity.noContent().build();
    }
}
