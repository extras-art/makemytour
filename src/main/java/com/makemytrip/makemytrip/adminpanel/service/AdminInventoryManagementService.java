package com.makemytrip.makemytrip.adminpanel.service;

import com.makemytrip.makemytrip.adminpanel.dto.AdminFlightDTO;
import com.makemytrip.makemytrip.adminpanel.dto.AdminHotelDTO;
import com.makemytrip.makemytrip.adminpanel.dto.FlightUpsertRequestDTO;
import com.makemytrip.makemytrip.adminpanel.dto.HotelUpsertRequestDTO;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.sqldailyupdate.event.InventoryRefreshedEvent;
import com.makemytrip.makemytrip.sqldailyupdate.service.BaselinePriceCache;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminInventoryManagementService {

    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final BaselinePriceCache baselinePriceCache;
    private final ApplicationEventPublisher eventPublisher;
    private final AdminAuditLogService auditLogService;

    public AdminInventoryManagementService(
        FlightRepository flightRepository,
        HotelRepository hotelRepository,
        BookingRepository bookingRepository,
        BaselinePriceCache baselinePriceCache,
        ApplicationEventPublisher eventPublisher,
        AdminAuditLogService auditLogService
    ) {
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
        this.baselinePriceCache = baselinePriceCache;
        this.eventPublisher = eventPublisher;
        this.auditLogService = auditLogService;
    }

    // ==================== FLIGHTS ====================

    public List<AdminFlightDTO> listAllFlights() {
        return flightRepository.findAll().stream()
            .map(f -> {
                int reserved = bookingRepository.countReservedSeatsByFlightId(f.getId());
                long total = reserved; // using reserved as booking count approximation
                return AdminFlightDTO.from(f, total, reserved);
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public AdminFlightDTO createFlight(FlightUpsertRequestDTO req, String adminEmail) {
        Flight flight = new Flight();
        applyFlightFields(flight, req);
        if (flight.getActive() == null) flight.setActive(true);
        Flight saved = flightRepository.save(flight);

        // Sync BaselinePriceCache
        if (saved.getPrice() != null) {
            baselinePriceCache.putFlightBaseline(saved.getId(), saved.getPrice());
        }

        // Notify FlightStatusSimulatorService via event
        eventPublisher.publishEvent(new InventoryRefreshedEvent(
            this,
            Collections.emptyList(),
            Collections.singletonList(saved.getId()),
            Collections.emptyList()
        ));

        auditLogService.log(adminEmail, "FLIGHT_CREATED", "FLIGHT", String.valueOf(saved.getId()),
            "Created flight: " + saved.getAirline() + " " + saved.getSource() + " → " + saved.getDestination());

        int reserved = bookingRepository.countReservedSeatsByFlightId(saved.getId());
        return AdminFlightDTO.from(saved, reserved, reserved);
    }

    @Transactional
    public AdminFlightDTO updateFlight(Long id, FlightUpsertRequestDTO req, String adminEmail) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flight not found: " + id));

        int reservedSeats = bookingRepository.countReservedSeatsByFlightId(id);
        boolean hasBookings = reservedSeats > 0;

        // Schedule update guard for booked flights
        boolean scheduleChanging = (req.getDepartureTime() != null && !req.getDepartureTime().equals(flight.getDepartureTime()))
            || (req.getArrivalTime() != null && !req.getArrivalTime().equals(flight.getArrivalTime()));

        if (scheduleChanging && hasBookings && !Boolean.TRUE.equals(req.getForceScheduleUpdate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This flight has " + reservedSeats + " reserved seats. Set forceScheduleUpdate=true to confirm schedule change.");
        }

        // Reserved capacity floor guard
        if (req.getAvailableSeats() != null && req.getAvailableSeats() < reservedSeats) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot set availableSeats=" + req.getAvailableSeats() + " — flight has " + reservedSeats + " reserved seats.");
        }

        boolean priceChanged = req.getPrice() != null && !req.getPrice().equals(flight.getPrice());
        boolean wasActive = Boolean.TRUE.equals(flight.getActive());

        applyFlightFields(flight, req);
        Flight saved = flightRepository.save(flight);

        // Sync BaselinePriceCache if price changed
        if (priceChanged && saved.getPrice() != null) {
            baselinePriceCache.putFlightBaseline(saved.getId(), saved.getPrice());
        }

        // Reactivated?
        boolean nowActive = Boolean.TRUE.equals(saved.getActive());
        List<Long> newIds = (!wasActive && nowActive) ? Collections.singletonList(saved.getId()) : Collections.emptyList();
        List<Long> updatedIds = (wasActive && nowActive) ? Collections.singletonList(saved.getId()) : Collections.emptyList();
        List<Long> deactivatedIds = (wasActive && !nowActive) ? Collections.singletonList(saved.getId()) : Collections.emptyList();

        eventPublisher.publishEvent(new InventoryRefreshedEvent(this, deactivatedIds, newIds, updatedIds));

        auditLogService.log(adminEmail, "FLIGHT_UPDATED", "FLIGHT", String.valueOf(saved.getId()),
            "Updated flight: " + saved.getAirline() + " " + saved.getSource() + " → " + saved.getDestination());

        int reserved = bookingRepository.countReservedSeatsByFlightId(saved.getId());
        return AdminFlightDTO.from(saved, reserved, reserved);
    }

    @Transactional
    public Map<String, String> deleteFlight(Long id, String adminEmail) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flight not found: " + id));

        int reservedSeats = bookingRepository.countReservedSeatsByFlightId(id);

        // Always soft-deactivate
        flight.setActive(false);
        flightRepository.save(flight);

        eventPublisher.publishEvent(new InventoryRefreshedEvent(
            this,
            Collections.singletonList(id),
            Collections.emptyList(),
            Collections.emptyList()
        ));

        String msg = reservedSeats > 0
            ? "Soft-deactivated to preserve existing bookings (" + reservedSeats + " reserved seats)"
            : "Soft-deactivated successfully";

        auditLogService.log(adminEmail, "FLIGHT_DEACTIVATED", "FLIGHT", String.valueOf(id), msg);

        return Map.of("message", msg, "flightId", String.valueOf(id), "active", "false");
    }

    // ==================== HOTELS ====================

    public List<AdminHotelDTO> listAllHotels() {
        return hotelRepository.findAll().stream()
            .map(h -> {
                int reserved = bookingRepository.countReservedRoomsByHotelId(h.getId());
                return AdminHotelDTO.from(h, reserved, reserved);
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public AdminHotelDTO createHotel(HotelUpsertRequestDTO req, String adminEmail) {
        Hotel hotel = new Hotel();
        applyHotelFields(hotel, req);
        if (hotel.getActive() == null) hotel.setActive(true);
        Hotel saved = hotelRepository.save(hotel);

        // Sync BaselinePriceCache
        if (saved.getPricePerNight() != null) {
            baselinePriceCache.putHotelBaseline(saved.getId(), saved.getPricePerNight());
        }

        auditLogService.log(adminEmail, "HOTEL_CREATED", "HOTEL", String.valueOf(saved.getId()),
            "Created hotel: " + saved.getName() + ", " + saved.getCity());

        return AdminHotelDTO.from(saved, 0, 0);
    }

    @Transactional
    public AdminHotelDTO updateHotel(Long id, HotelUpsertRequestDTO req, String adminEmail) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + id));

        int reservedRooms = bookingRepository.countReservedRoomsByHotelId(id);

        // Reserved capacity floor guard
        if (req.getAvailableRooms() != null && req.getAvailableRooms() < reservedRooms) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot set availableRooms=" + req.getAvailableRooms() + " — hotel has " + reservedRooms + " reserved rooms.");
        }

        boolean priceChanged = req.getPricePerNight() != null && !req.getPricePerNight().equals(hotel.getPricePerNight());
        applyHotelFields(hotel, req);
        Hotel saved = hotelRepository.save(hotel);

        // Sync BaselinePriceCache if price changed
        if (priceChanged && saved.getPricePerNight() != null) {
            baselinePriceCache.putHotelBaseline(saved.getId(), saved.getPricePerNight());
        }

        auditLogService.log(adminEmail, "HOTEL_UPDATED", "HOTEL", String.valueOf(saved.getId()),
            "Updated hotel: " + saved.getName() + ", " + saved.getCity());

        int reserved = bookingRepository.countReservedRoomsByHotelId(saved.getId());
        return AdminHotelDTO.from(saved, reserved, reserved);
    }

    @Transactional
    public Map<String, String> deleteHotel(Long id, String adminEmail) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + id));

        int reservedRooms = bookingRepository.countReservedRoomsByHotelId(id);
        hotel.setActive(false);
        hotelRepository.save(hotel);

        String msg = reservedRooms > 0
            ? "Soft-deactivated to preserve existing bookings (" + reservedRooms + " reserved rooms)"
            : "Soft-deactivated successfully";

        auditLogService.log(adminEmail, "HOTEL_DEACTIVATED", "HOTEL", String.valueOf(id), msg);

        return Map.of("message", msg, "hotelId", String.valueOf(id), "active", "false");
    }

    // ==================== HELPERS ====================

    private void applyFlightFields(Flight flight, FlightUpsertRequestDTO req) {
        if (req.getAirline() != null) flight.setAirline(req.getAirline());
        if (req.getSource() != null) flight.setSource(req.getSource());
        if (req.getDestination() != null) flight.setDestination(req.getDestination());
        if (req.getDepartureTime() != null) flight.setDepartureTime(req.getDepartureTime());
        if (req.getArrivalTime() != null) flight.setArrivalTime(req.getArrivalTime());
        if (req.getPrice() != null) flight.setPrice(req.getPrice());
        if (req.getAvailableSeats() != null) flight.setAvailableSeats(req.getAvailableSeats());
        if (req.getActive() != null) flight.setActive(req.getActive());
    }

    private void applyHotelFields(Hotel hotel, HotelUpsertRequestDTO req) {
        if (req.getName() != null) hotel.setName(req.getName());
        if (req.getCity() != null) hotel.setCity(req.getCity());
        if (req.getAddress() != null) hotel.setAddress(req.getAddress());
        if (req.getAvailableRooms() != null) hotel.setAvailableRooms(req.getAvailableRooms());
        if (req.getStarRating() != null) hotel.setStarRating(req.getStarRating());
        if (req.getPricePerNight() != null) hotel.setPricePerNight(req.getPricePerNight());
        if (req.getActive() != null) hotel.setActive(req.getActive());
        // imageUrl is not a DB field on Hotel entity, but can be used as a hint on the frontend
    }
}

