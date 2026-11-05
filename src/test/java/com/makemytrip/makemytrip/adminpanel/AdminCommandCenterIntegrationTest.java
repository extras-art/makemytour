package com.makemytrip.makemytrip.adminpanel;

import com.makemytrip.makemytrip.adminpanel.dto.FlightUpsertRequestDTO;
import com.makemytrip.makemytrip.adminpanel.dto.AdminFlightDTO;
import com.makemytrip.makemytrip.adminpanel.service.AdminInventoryManagementService;
import com.makemytrip.makemytrip.adminpanel.service.AdminAuditLogService;
import com.makemytrip.makemytrip.adminpanel.service.AdminUserManagementService;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.sqldailyupdate.event.InventoryRefreshedEvent;
import com.makemytrip.makemytrip.sqldailyupdate.service.BaselinePriceCache;
import com.makemytrip.makemytrip.sqldailyupdate.service.DailyInventoryUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminCommandCenterIntegrationTest {

    private FlightRepository flightRepository;
    private HotelRepository hotelRepository;
    private BookingRepository bookingRepository;
    private UserRepository userRepository;
    private BaselinePriceCache baselinePriceCache;
    private ApplicationEventPublisher eventPublisher;
    private AdminAuditLogService auditLogService;
    private AdminInventoryManagementService inventoryService;
    private AdminUserManagementService userManagementService;

    @BeforeEach
    void setUp() {
        flightRepository = mock(FlightRepository.class);
        hotelRepository = mock(HotelRepository.class);
        bookingRepository = mock(BookingRepository.class);
        userRepository = mock(UserRepository.class);
        baselinePriceCache = mock(BaselinePriceCache.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        auditLogService = new AdminAuditLogService();

        inventoryService = new AdminInventoryManagementService(
            flightRepository, hotelRepository, bookingRepository,
            baselinePriceCache, eventPublisher, auditLogService
        );
        userManagementService = new AdminUserManagementService(userRepository, bookingRepository);
    }

    // ===== Test 1: Admin flight price edit updates BaselinePriceCache =====
    @Test
    void adminFlightPriceEdit_shouldUpdateBaselinePriceCache() {
        Flight existing = new Flight();
        existing.setId(10L);
        existing.setAirline("IndiGo");
        existing.setSource("Delhi");
        existing.setDestination("Mumbai");
        existing.setPrice(BigDecimal.valueOf(5000));
        existing.setAvailableSeats(100);
        existing.setActive(true);

        when(flightRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(bookingRepository.countReservedSeatsByFlightId(10L)).thenReturn(0);

        Flight saved = new Flight();
        saved.setId(10L);
        saved.setAirline("IndiGo");
        saved.setSource("Delhi");
        saved.setDestination("Mumbai");
        saved.setPrice(BigDecimal.valueOf(7500));
        saved.setAvailableSeats(100);
        saved.setActive(true);
        when(flightRepository.save(any())).thenReturn(saved);

        FlightUpsertRequestDTO req = new FlightUpsertRequestDTO();
        req.setPrice(BigDecimal.valueOf(7500));

        inventoryService.updateFlight(10L, req, "admin@test.com");

        verify(baselinePriceCache, times(1)).putFlightBaseline(10L, BigDecimal.valueOf(7500));
    }

    // ===== Test 2: Admin flight creation fires InventoryRefreshedEvent with correct newFlightIds =====
    @Test
    void adminFlightCreate_shouldFireInventoryRefreshedEventWithNewFlightId() {
        Flight saved = new Flight();
        saved.setId(42L);
        saved.setAirline("AirIndia");
        saved.setSource("Chennai");
        saved.setDestination("Hyderabad");
        saved.setPrice(BigDecimal.valueOf(3200));
        saved.setAvailableSeats(80);
        saved.setActive(true);
        when(flightRepository.save(any())).thenReturn(saved);
        when(bookingRepository.countReservedSeatsByFlightId(42L)).thenReturn(0);

        FlightUpsertRequestDTO req = new FlightUpsertRequestDTO();
        req.setAirline("AirIndia");
        req.setSource("Chennai");
        req.setDestination("Hyderabad");
        req.setPrice(BigDecimal.valueOf(3200));
        req.setAvailableSeats(80);

        inventoryService.createFlight(req, "admin@test.com");

        ArgumentCaptor<InventoryRefreshedEvent> captor = ArgumentCaptor.forClass(InventoryRefreshedEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        InventoryRefreshedEvent event = captor.getValue();
        assertTrue(event.getNewFlightIds().contains(42L), "newFlightIds must include the new flight ID");
        assertTrue(event.getDeactivatedFlightIds().isEmpty());
        assertTrue(event.getUpdatedFlightIds().isEmpty());
    }

    // ===== Test 3: Soft-deactivation preserves booked flights (doesn't throw) =====
    @Test
    void adminFlightDelete_withActiveBookings_shouldSoftDeactivate() {
        Flight flight = new Flight();
        flight.setId(5L);
        flight.setAirline("SpiceJet");
        flight.setSource("Kolkata");
        flight.setDestination("Delhi");
        flight.setActive(true);
        flight.setAvailableSeats(50);
        when(flightRepository.findById(5L)).thenReturn(Optional.of(flight));
        when(bookingRepository.countReservedSeatsByFlightId(5L)).thenReturn(10); // has 10 reserved
        when(flightRepository.save(any())).thenReturn(flight);

        var result = inventoryService.deleteFlight(5L, "admin@test.com");

        // Should NOT throw, should soft-deactivate
        verify(flightRepository).save(argThat(f -> !Boolean.TRUE.equals(f.getActive())));
        assertTrue(result.get("message").contains("Soft-deactivated to preserve existing bookings"));

        ArgumentCaptor<InventoryRefreshedEvent> captor = ArgumentCaptor.forClass(InventoryRefreshedEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertTrue(captor.getValue().getDeactivatedFlightIds().contains(5L));
    }

    // ===== Test 4: Admin self-demotion protection =====
    @Test
    void adminSelfDemotion_shouldThrowForbidden() {
        Users admin = new Users();
        admin.setId(1L);
        admin.setEmail("admin@test.com");
        admin.setRole("ROLE_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        assertThrows(ResponseStatusException.class, () ->
            userManagementService.updateRole(1L, "ROLE_USER", "admin@test.com")
        );
    }

    // ===== Test 5: Reserved seat floor guard on flight update =====
    @Test
    void adminFlightUpdate_seatsBelowReserved_shouldThrowBadRequest() {
        Flight flight = new Flight();
        flight.setId(7L);
        flight.setAirline("GoAir");
        flight.setSource("Pune");
        flight.setDestination("Goa");
        flight.setPrice(BigDecimal.valueOf(4000));
        flight.setAvailableSeats(50);
        flight.setActive(true);
        when(flightRepository.findById(7L)).thenReturn(Optional.of(flight));
        when(bookingRepository.countReservedSeatsByFlightId(7L)).thenReturn(20);

        FlightUpsertRequestDTO req = new FlightUpsertRequestDTO();
        req.setAvailableSeats(5); // below 20 reserved

        assertThrows(ResponseStatusException.class, () ->
            inventoryService.updateFlight(7L, req, "admin@test.com")
        );
    }

    // ===== Test 6: Audit log records admin actions =====
    @Test
    void adminAuditLog_shouldRecordActions() {
        auditLogService.log("admin@test.com", "FLIGHT_CREATED", "FLIGHT", "99", "Created flight IndiGo");
        auditLogService.log("admin@test.com", "HOTEL_CREATED", "HOTEL", "55", "Created hotel Taj");

        var logs = auditLogService.getAll();
        assertEquals(2, logs.size());
        // Most recent first
        assertEquals("HOTEL_CREATED", logs.get(0).getAction());
        assertEquals("FLIGHT_CREATED", logs.get(1).getAction());
    }
}

