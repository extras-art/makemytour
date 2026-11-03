package com.makemytrip.makemytrip.sqldailyupdate;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.sqldailyupdate.config.InventoryUpdateProperties;
import com.makemytrip.makemytrip.sqldailyupdate.generator.InventoryDataGenerator;
import com.makemytrip.makemytrip.sqldailyupdate.service.BaselinePriceCache;
import com.makemytrip.makemytrip.sqldailyupdate.service.FlightInventoryUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlightInventoryUpdateServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BaselinePriceCache baselinePriceCache;

    @Mock
    private InventoryDataGenerator dataGenerator;

    private InventoryUpdateProperties properties;
    private FlightInventoryUpdateService service;

    @BeforeEach
    void setUp() {
        properties = new InventoryUpdateProperties();
        service = new FlightInventoryUpdateService(
                flightRepository,
                bookingRepository,
                baselinePriceCache,
                dataGenerator,
                properties
        );
    }

    @Test
    void testRefreshFlightInventory_SoftDeactivatesExpiredAndGeneratesReplacement() {
        Flight expired = new Flight();
        expired.setId(101L);
        expired.setAirline("IndiGo 6E-101");
        expired.setSource("DEL");
        expired.setDestination("BOM");
        expired.setDepartureTime(LocalDateTime.now().minusDays(1));
        expired.setArrivalTime(LocalDateTime.now().minusDays(1).plusHours(2));
        expired.setPrice(BigDecimal.valueOf(4000.00));
        expired.setActive(true);

        when(flightRepository.findActiveFlightsDepartedBefore(any(LocalDateTime.class))).thenReturn(List.of(expired));
        when(flightRepository.findActiveFlightsDepartingAfter(any(LocalDateTime.class))).thenReturn(List.of());
        when(bookingRepository.findDistinctBookedFlightIds()).thenReturn(List.of());

        when(baselinePriceCache.getFlightBaseline(eq(101L), any())).thenReturn(BigDecimal.valueOf(4000.00));
        when(dataGenerator.generateFutureDepartureTime(any(), anyInt(), anyInt()))
                .thenReturn(LocalDateTime.now().plusDays(10));
        when(dataGenerator.calculateArrivalTime(any(), any()))
                .thenReturn(LocalDateTime.now().plusDays(10).plusHours(2));
        when(dataGenerator.fluctuateFlightPrice(any())).thenReturn(BigDecimal.valueOf(4200.00));
        when(dataGenerator.generateAvailableSeats()).thenReturn(120);

        Flight savedReplacement = new Flight();
        savedReplacement.setId(202L);
        when(flightRepository.save(any(Flight.class))).thenReturn(savedReplacement);

        FlightInventoryUpdateService.FlightRefreshResult result = service.refreshFlightInventory();

        assertNotNull(result);
        assertEquals(List.of(101L), result.getDeactivatedFlightIds());
        assertEquals(List.of(202L), result.getNewFlightIds());

        // Verify expired flight was marked active = false, never deleted
        assertFalse(expired.getActive());
        verify(flightRepository, never()).delete(any());
        verify(flightRepository, never()).deleteById(any());

        // Verify baseline price was recorded for new flight
        verify(baselinePriceCache).putFlightBaseline(eq(202L), eq(BigDecimal.valueOf(4000.00)));
    }

    @Test
    void testRefreshFlightInventory_BookedFlightPreservesScheduleAndSeats() {
        Flight bookedFlight = new Flight();
        bookedFlight.setId(301L);
        bookedFlight.setAirline("Air India AI-101");
        bookedFlight.setSource("BLR");
        bookedFlight.setDestination("DEL");
        LocalDateTime scheduledDep = LocalDateTime.now().plusDays(5);
        LocalDateTime scheduledArr = scheduledDep.plusHours(2).plusMinutes(30);
        bookedFlight.setDepartureTime(scheduledDep);
        bookedFlight.setArrivalTime(scheduledArr);
        bookedFlight.setAvailableSeats(50);
        bookedFlight.setPrice(BigDecimal.valueOf(6000.00));
        bookedFlight.setActive(true);

        when(flightRepository.findActiveFlightsDepartedBefore(any())).thenReturn(List.of());
        when(flightRepository.findActiveFlightsDepartingAfter(any())).thenReturn(List.of(bookedFlight));
        when(bookingRepository.findDistinctBookedFlightIds()).thenReturn(List.of(301L));
        when(bookingRepository.countReservedSeatsByFlightId(301L)).thenReturn(40);
        when(baselinePriceCache.getFlightBaseline(eq(301L), any())).thenReturn(BigDecimal.valueOf(6000.00));
        when(dataGenerator.fluctuateFlightPrice(any())).thenReturn(BigDecimal.valueOf(6300.00));

        FlightInventoryUpdateService.FlightRefreshResult result = service.refreshFlightInventory();

        assertEquals(List.of(301L), result.getUpdatedFlightIds());
        // Departure and arrival times must remain untouched
        assertEquals(scheduledDep, bookedFlight.getDepartureTime());
        assertEquals(scheduledArr, bookedFlight.getArrivalTime());
        // Available seats must not fall below reserved seats
        assertTrue(bookedFlight.getAvailableSeats() >= 40);
        assertEquals(BigDecimal.valueOf(6300.00), bookedFlight.getPrice());
    }

    @Test
    void testRefreshFlightInventory_UnbookedFlightAppliesMinorScheduleVariance() {
        Flight unbookedFlight = new Flight();
        unbookedFlight.setId(401L);
        unbookedFlight.setAirline("SpiceJet SG-202");
        unbookedFlight.setSource("GOI");
        unbookedFlight.setDestination("BOM");
        LocalDateTime scheduledDep = LocalDateTime.now().plusDays(8);
        LocalDateTime scheduledArr = scheduledDep.plusHours(1);
        unbookedFlight.setDepartureTime(scheduledDep);
        unbookedFlight.setArrivalTime(scheduledArr);
        unbookedFlight.setAvailableSeats(60);
        unbookedFlight.setPrice(BigDecimal.valueOf(3500.00));
        unbookedFlight.setActive(true);

        when(flightRepository.findActiveFlightsDepartedBefore(any())).thenReturn(List.of());
        when(flightRepository.findActiveFlightsDepartingAfter(any())).thenReturn(List.of(unbookedFlight));
        when(bookingRepository.findDistinctBookedFlightIds()).thenReturn(List.of()); // No bookings
        when(baselinePriceCache.getFlightBaseline(eq(401L), any())).thenReturn(BigDecimal.valueOf(3500.00));
        when(dataGenerator.fluctuateFlightPrice(any())).thenReturn(BigDecimal.valueOf(3800.00));

        LocalDateTime shiftedDep = scheduledDep.plusMinutes(20);
        when(dataGenerator.applyMinorScheduleVariance(scheduledDep)).thenReturn(shiftedDep);
        when(dataGenerator.generateAvailableSeats()).thenReturn(95);

        FlightInventoryUpdateService.FlightRefreshResult result = service.refreshFlightInventory();

        assertEquals(List.of(401L), result.getUpdatedFlightIds());
        assertEquals(shiftedDep, unbookedFlight.getDepartureTime());
        assertEquals(shiftedDep.plusHours(1), unbookedFlight.getArrivalTime());
        assertEquals(95, unbookedFlight.getAvailableSeats());
        assertEquals(BigDecimal.valueOf(3800.00), unbookedFlight.getPrice());
    }
}

