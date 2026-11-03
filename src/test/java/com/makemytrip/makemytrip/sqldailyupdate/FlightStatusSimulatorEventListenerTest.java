package com.makemytrip.makemytrip.sqldailyupdate;

import com.makemytrip.makemytrip.features.flightstatus.dto.FlightStatusUpdateDTO;
import com.makemytrip.makemytrip.features.flightstatus.model.FlightStatusEnum;
import com.makemytrip.makemytrip.features.flightstatus.service.FlightStatusSimulatorService;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.sqldailyupdate.event.InventoryRefreshedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlightStatusSimulatorEventListenerTest {

    @Mock
    private FlightRepository flightRepository;

    private FlightStatusSimulatorService simulatorService;

    @BeforeEach
    void setUp() {
        simulatorService = new FlightStatusSimulatorService(flightRepository);
    }

    @Test
    void testHandleInventoryRefreshed_DeactivatesAndInitializesNew() {
        // Setup flight 10 in cache
        Flight f10 = new Flight();
        f10.setId(10L);
        f10.setAirline("IndiGo 6E-10");
        f10.setSource("DEL");
        f10.setDestination("BOM");
        f10.setActive(true);
        when(flightRepository.findById(10L)).thenReturn(Optional.of(f10));

        FlightStatusUpdateDTO initial10 = simulatorService.getStatus(10L);
        assertNotNull(initial10);

        // Setup flight 20 as newly generated flight
        Flight f20 = new Flight();
        f20.setId(20L);
        f20.setAirline("Air India AI-20");
        f20.setSource("DEL");
        f20.setDestination("BOM");
        LocalDateTime dep20 = LocalDateTime.now().plusDays(10);
        LocalDateTime arr20 = dep20.plusHours(2);
        f20.setDepartureTime(dep20);
        f20.setArrivalTime(arr20);
        f20.setActive(true);
        when(flightRepository.findById(20L)).thenReturn(Optional.of(f20));

        // Publish event: 10 deactivated, 20 new
        InventoryRefreshedEvent event = new InventoryRefreshedEvent(this, List.of(10L), List.of(20L), List.of());
        simulatorService.handleInventoryRefreshed(event);

        // Flight 20 should immediately be available in cache with ON_TIME state
        FlightStatusUpdateDTO status20 = simulatorService.getStatus(20L);
        assertNotNull(status20);
        assertEquals(20L, status20.getFlightId());
        assertEquals(FlightStatusEnum.ON_TIME, status20.getStatus());
        assertEquals("On Time", status20.getStatusDisplay());
        assertEquals(0, status20.getDelayMinutes());

        // Flight 10 was removed from cache, and if marked inactive in DB, should throw ResourceNotFound
        f10.setActive(false);
        assertThrows(RuntimeException.class, () -> simulatorService.getStatus(10L));
    }

    @Test
    void testHandleInventoryRefreshed_UpdatedFlightPreservesDelayedState() {
        Flight f30 = new Flight();
        f30.setId(30L);
        f30.setAirline("Vistara UK-30");
        f30.setSource("DEL");
        f30.setDestination("BLR");
        LocalDateTime dep30 = LocalDateTime.now().plusDays(5);
        LocalDateTime arr30 = dep30.plusHours(2).plusMinutes(45);
        f30.setDepartureTime(dep30);
        f30.setArrivalTime(arr30);
        f30.setActive(true);
        when(flightRepository.findById(30L)).thenReturn(Optional.of(f30));

        // Put in cache and simulate a delay transition
        FlightStatusUpdateDTO status30 = simulatorService.getStatus(30L);
        simulatorService.simulateStatusChange(30L); // Transitions to DELAYED or other simulated state
        FlightStatusEnum currentState = status30.getStatus();
        int currentDelay = status30.getDelayMinutes();

        // Now schedule shifts slightly during daily refresh
        LocalDateTime shiftedDep = dep30.plusMinutes(15);
        LocalDateTime shiftedArr = arr30.plusMinutes(15);
        f30.setDepartureTime(shiftedDep);
        f30.setArrivalTime(shiftedArr);

        InventoryRefreshedEvent event = new InventoryRefreshedEvent(this, List.of(), List.of(), List.of(30L));
        simulatorService.handleInventoryRefreshed(event);

        // Status and delay reasons should be preserved
        assertEquals(currentState, status30.getStatus());
        assertEquals(currentDelay, status30.getDelayMinutes());
        assertEquals(shiftedDep, status30.getOriginalDeparture());
        assertEquals(shiftedArr, status30.getOriginalArrival());
    }
}

