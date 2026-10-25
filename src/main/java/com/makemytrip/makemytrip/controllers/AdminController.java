package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.models.AdminAuditLog;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.AdminAuditLogRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AdminController {

    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AdminController(
        FlightRepository flightRepository,
        HotelRepository hotelRepository,
        AdminAuditLogRepository auditLogRepository,
        UserRepository userRepository
    ) {
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    private void recordAudit(Authentication authentication, String action, String entityType, Long entityId, String details) {
        Long adminUserId = null;
        String adminEmail = authentication != null ? authentication.getName() : "system";
        if (authentication != null && authentication.getName() != null) {
            adminUserId = userRepository.findByEmailIgnoreCase(authentication.getName())
                .map(Users::getId)
                .orElse(null);
        }
        auditLogRepository.save(new AdminAuditLog(adminUserId, adminEmail, action, entityType, entityId, details));
    }

    // -------------------- FLIGHTS --------------------

    @GetMapping("/flights")
    public List<Flight> getFlights() {
        return flightRepository.findByActiveTrue();
    }

    @GetMapping("/flights/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable Long id) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flight not found with id: " + id));
        return ResponseEntity.ok(flight);
    }

    @GetMapping("/flights/search")
    public ResponseEntity<?> searchFlights(
        @RequestParam(required = false) String source,
        @RequestParam(required = false) String destination,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false, defaultValue = "1") Integer passengers,
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false, defaultValue = "20") Integer size,
        @RequestParam(required = false, defaultValue = "price") String sortBy,
        @RequestParam(required = false, defaultValue = "asc") String sortDir
    ) {
        LocalDateTime startDate = date != null ? date.atStartOfDay() : null;
        LocalDateTime endDate = date != null ? date.plusDays(1).atStartOfDay() : null;

        String safeSortProperty = "departureTime".equalsIgnoreCase(sortBy) ? "departureTime" : "price";
        Sort sort = "desc".equalsIgnoreCase(sortDir)
            ? Sort.by(safeSortProperty).descending()
            : Sort.by(safeSortProperty).ascending();

        if (page != null && page >= 0) {
            Page<Flight> pageResult = flightRepository.searchFlights(
                source, destination, startDate, endDate, passengers,
                PageRequest.of(page, Math.max(1, size), sort)
            );
            return ResponseEntity.ok(pageResult);
        }

        List<Flight> listResult = flightRepository.searchFlights(
            source, destination, startDate, endDate, passengers,
            PageRequest.of(0, 100, sort)
        ).getContent();

        return ResponseEntity.ok(listResult);
    }

    @PostMapping("/flights")
    public Flight addFlight(@RequestBody Flight flight, Authentication authentication) {
        flight.setId(null);
        if (flight.getActive() == null) {
            flight.setActive(true);
        }
        Flight saved = flightRepository.save(flight);
        recordAudit(authentication, "CREATE_FLIGHT", "FLIGHT", saved.getId(), "Created flight: " + saved.getAirline());
        return saved;
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<Flight> updateFlight(
        @PathVariable Long id,
        @RequestBody Flight flightDetails,
        Authentication authentication
    ) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flight not found with id: " + id));

        if (flightDetails.getAirline() != null) flight.setAirline(flightDetails.getAirline());
        if (flightDetails.getSource() != null) flight.setSource(flightDetails.getSource());
        if (flightDetails.getDestination() != null) flight.setDestination(flightDetails.getDestination());
        if (flightDetails.getDepartureTime() != null) flight.setDepartureTime(flightDetails.getDepartureTime());
        if (flightDetails.getArrivalTime() != null) flight.setArrivalTime(flightDetails.getArrivalTime());
        if (flightDetails.getPrice() != null) flight.setPrice(flightDetails.getPrice());
        if (flightDetails.getAvailableSeats() != null) flight.setAvailableSeats(flightDetails.getAvailableSeats());
        if (flightDetails.getActive() != null) flight.setActive(flightDetails.getActive());

        Flight updated = flightRepository.save(flight);
        recordAudit(authentication, "UPDATE_FLIGHT", "FLIGHT", id, "Updated flight: " + updated.getAirline());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/flights/{id}/deactivate")
    public ResponseEntity<Flight> deactivateFlight(
        @PathVariable Long id,
        Authentication authentication
    ) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flight not found with id: " + id));

        flight.setActive(false);
        Flight updated = flightRepository.save(flight);
        recordAudit(authentication, "DEACTIVATE_FLIGHT", "FLIGHT", id, "Deactivated flight: " + updated.getAirline());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/admin/flights")
    public List<Flight> getAllFlightsForAdmin() {
        return flightRepository.findAll();
    }

    // -------------------- HOTELS --------------------

    @GetMapping("/hotels")
    public List<Hotel> getHotels() {
        return hotelRepository.findByActiveTrue();
    }

    @GetMapping("/hotels/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable Long id) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return ResponseEntity.ok(hotel);
    }

    @GetMapping("/hotels/search")
    public ResponseEntity<?> searchHotels(
        @RequestParam(required = false) String city,
        @RequestParam(required = false, defaultValue = "1") Integer rooms,
        @RequestParam(required = false) Integer minRating,
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false, defaultValue = "20") Integer size,
        @RequestParam(required = false, defaultValue = "pricePerNight") String sortBy,
        @RequestParam(required = false, defaultValue = "asc") String sortDir
    ) {
        String safeSortProperty = "starRating".equalsIgnoreCase(sortBy) ? "starRating" : "pricePerNight";
        Sort sort = "desc".equalsIgnoreCase(sortDir)
            ? Sort.by(safeSortProperty).descending()
            : Sort.by(safeSortProperty).ascending();

        if (page != null && page >= 0) {
            Page<Hotel> pageResult = hotelRepository.searchHotels(
                city, rooms, minRating, PageRequest.of(page, Math.max(1, size), sort)
            );
            return ResponseEntity.ok(pageResult);
        }

        List<Hotel> listResult = hotelRepository.searchHotels(
            city, rooms, minRating, PageRequest.of(0, 100, sort)
        ).getContent();

        return ResponseEntity.ok(listResult);
    }

    @PostMapping("/hotels")
    public Hotel addHotel(@RequestBody Hotel hotel, Authentication authentication) {
        hotel.setId(null);
        if (hotel.getActive() == null) {
            hotel.setActive(true);
        }
        Hotel saved = hotelRepository.save(hotel);
        recordAudit(authentication, "CREATE_HOTEL", "HOTEL", saved.getId(), "Created hotel: " + saved.getName());
        return saved;
    }

    @PutMapping("/hotels/{id}")
    public ResponseEntity<Hotel> updateHotel(
        @PathVariable Long id,
        @RequestBody Hotel hotelDetails,
        Authentication authentication
    ) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        if (hotelDetails.getName() != null) hotel.setName(hotelDetails.getName());
        if (hotelDetails.getCity() != null) hotel.setCity(hotelDetails.getCity());
        if (hotelDetails.getAddress() != null) hotel.setAddress(hotelDetails.getAddress());
        if (hotelDetails.getAvailableRooms() != null) hotel.setAvailableRooms(hotelDetails.getAvailableRooms());
        if (hotelDetails.getStarRating() != null) hotel.setStarRating(hotelDetails.getStarRating());
        if (hotelDetails.getPricePerNight() != null) hotel.setPricePerNight(hotelDetails.getPricePerNight());
        if (hotelDetails.getActive() != null) hotel.setActive(hotelDetails.getActive());

        Hotel updated = hotelRepository.save(hotel);
        recordAudit(authentication, "UPDATE_HOTEL", "HOTEL", id, "Updated hotel: " + updated.getName());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/hotels/{id}/deactivate")
    public ResponseEntity<Hotel> deactivateHotel(
        @PathVariable Long id,
        Authentication authentication
    ) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        hotel.setActive(false);
        Hotel updated = hotelRepository.save(hotel);
        recordAudit(authentication, "DEACTIVATE_HOTEL", "HOTEL", id, "Deactivated hotel: " + updated.getName());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/admin/hotels")
    public List<Hotel> getAllHotelsForAdmin() {
        return hotelRepository.findAll();
    }

    // -------------------- AUDIT LOGS --------------------

    @GetMapping("/admin/audit-logs")
    public List<AdminAuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}