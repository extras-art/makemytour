package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.dto.CreateBookingRequestDto;
import com.makemytrip.makemytrip.exceptions.InsufficientInventoryException;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.models.Booking;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;

    public BookingService(
        BookingRepository bookingRepository,
        UserRepository userRepository,
        FlightRepository flightRepository,
        HotelRepository hotelRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
    }

    @Transactional
    public Booking createBooking(CreateBookingRequestDto request, String authenticatedEmail) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request cannot be null");
        }

        // Enforce exact XOR: either flight or hotel, never neither or both
        boolean hasFlight = request.getFlightId() != null;
        boolean hasHotel = request.getHotelId() != null;
        if (hasFlight == hasHotel) {
            throw new IllegalArgumentException(
                "A booking must specify either a flight or a hotel, not both or neither."
            );
        }

        // Idempotency check: if key already booked, return existing booking immediately
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<Booking> existing = bookingRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        // Resolve user
        Users user = null;
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            user = userRepository.findByEmailIgnoreCase(authenticatedEmail).orElse(null);
        }
        if (user == null && request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        }
        if (user == null) {
            throw new IllegalArgumentException("User identification is required for booking");
        }

        int quantity = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setQuantity(quantity);
        booking.setCurrency("INR");
        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus("PAYMENT_NOT_IMPLEMENTED");
        booking.setIdempotencyKey(request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()
            ? request.getIdempotencyKey().trim()
            : null
        );
        booking.setCreatedAt(LocalDateTime.now());

        if (hasFlight) {
            // Pessimistic lock on flight inventory (BUG-07)
            Flight flight = flightRepository.findByIdWithLock(request.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException("Flight not found with id: " + request.getFlightId()));

            if (Boolean.FALSE.equals(flight.getActive())) {
                throw new ResourceNotFoundException("Flight is no longer active");
            }

            int availableSeats = flight.getAvailableSeats() != null ? flight.getAvailableSeats() : 0;
            if (availableSeats < quantity) {
                throw new InsufficientInventoryException(
                    "Not enough available seats. Requested: " + quantity + ", Available: " + availableSeats
                );
            }

            // Decrement inventory
            flight.setAvailableSeats(availableSeats - quantity);
            flightRepository.save(flight);

            // Backend Price Calculation (BUG-06)
            BigDecimal unitPrice = flight.getPrice() != null ? flight.getPrice() : BigDecimal.ZERO;
            BigDecimal baseTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            BigDecimal taxes = baseTotal.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal grandTotal = baseTotal.add(taxes);

            booking.setFlight(flight);
            booking.setNights(1);
            booking.setUnitPriceSnapshot(unitPrice);
            booking.setTaxesAndFees(taxes);
            booking.setTotalPrice(grandTotal);

        } else {
            // Pessimistic lock on hotel inventory (BUG-07)
            Hotel hotel = hotelRepository.findByIdWithLock(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));

            if (Boolean.FALSE.equals(hotel.getActive())) {
                throw new ResourceNotFoundException("Hotel is no longer active");
            }

            int availableRooms = hotel.getAvailableRooms() != null ? hotel.getAvailableRooms() : 0;
            if (availableRooms < quantity) {
                throw new InsufficientInventoryException(
                    "Not enough available rooms. Requested: " + quantity + ", Available: " + availableRooms
                );
            }

            // Decrement inventory
            hotel.setAvailableRooms(availableRooms - quantity);
            hotelRepository.save(hotel);

            // Calculate nights
            LocalDate checkIn = request.getCheckInDate() != null ? request.getCheckInDate() : LocalDate.now();
            LocalDate checkOut = request.getCheckOutDate() != null ? request.getCheckOutDate() : checkIn.plusDays(1);
            long days = ChronoUnit.DAYS.between(checkIn, checkOut);
            int nights = (int) Math.max(1, days);

            // Backend Price Calculation (BUG-06)
            BigDecimal unitPrice = hotel.getPricePerNight() != null ? hotel.getPricePerNight() : BigDecimal.ZERO;
            BigDecimal baseTotal = unitPrice.multiply(BigDecimal.valueOf(quantity)).multiply(BigDecimal.valueOf(nights));
            BigDecimal taxes = baseTotal.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal grandTotal = baseTotal.add(taxes);

            booking.setHotel(hotel);
            booking.setNights(nights);
            booking.setCheckInDate(checkIn);
            booking.setCheckOutDate(checkOut);
            booking.setUnitPriceSnapshot(unitPrice);
            booking.setTaxesAndFees(taxes);
            booking.setTotalPrice(grandTotal);
        }

        return bookingRepository.save(booking);
    }

    // Backward-compatible overload
    @Transactional
    public Booking createBooking(Long userId, Long flightId, Long hotelId) {
        CreateBookingRequestDto dto = new CreateBookingRequestDto();
        dto.setUserId(userId);
        dto.setFlightId(flightId);
        dto.setHotelId(hotelId);
        dto.setQuantity(1);
        return createBooking(dto, null);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsForUser(Long userId, String authEmail) {
        if (authEmail != null) {
            Users authUser = userRepository.findByEmailIgnoreCase(authEmail).orElse(null);
            if (authUser != null) {
                boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
                if (!isAdmin) {
                    return bookingRepository.findByUser_Id(authUser.getId());
                }
            }
        }
        if (userId != null) {
            return bookingRepository.findByUser_Id(userId);
        }
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsForUser(Long userId) {
        return getBookingsForUser(userId, null);
    }

    @Transactional
    public void cancelBooking(Long bookingId, String authEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            return;
        }

        // Release inventory back
        if (booking.getFlight() != null) {
            Flight flight = flightRepository.findByIdWithLock(booking.getFlight().getId()).orElse(null);
            if (flight != null) {
                int seats = flight.getAvailableSeats() != null ? flight.getAvailableSeats() : 0;
                flight.setAvailableSeats(seats + booking.getQuantity());
                flightRepository.save(flight);
            }
        } else if (booking.getHotel() != null) {
            Hotel hotel = hotelRepository.findByIdWithLock(booking.getHotel().getId()).orElse(null);
            if (hotel != null) {
                int rooms = hotel.getAvailableRooms() != null ? hotel.getAvailableRooms() : 0;
                hotel.setAvailableRooms(rooms + booking.getQuantity());
                hotelRepository.save(hotel);
            }
        }

        booking.setStatus("CANCELLED");
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        cancelBooking(bookingId, null);
    }
}