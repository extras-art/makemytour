package com.makemytrip.makemytrip.features.flightstatus.service;

import com.makemytrip.makemytrip.features.flightstatus.dto.FlightStatusUpdateDTO;
import com.makemytrip.makemytrip.features.flightstatus.model.FlightStatusEnum;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlightStatusSimulatorServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private FlightStatusSimulatorService simulatorService;

    private Flight mockFlight1;
    private Flight mockFlight2;

    @BeforeEach
    void setUp() {
        mockFlight1 = new Flight();
        mockFlight1.setId(1L);
        mockFlight1.setAirline("IndiGo 6E-204");
        mockFlight1.setSource("Delhi");
        mockFlight1.setDestination("Mumbai");
        mockFlight1.setDepartureTime(LocalDateTime.of(2026, 11, 2, 6, 0));
        mockFlight1.setArrivalTime(LocalDateTime.of(2026, 11, 2, 8, 15));
        mockFlight1.setPrice(new BigDecimal("4999.00"));
        mockFlight1.setAvailableSeats(45);
        mockFlight1.setActive(true);

        mockFlight2 = new Flight();
        mockFlight2.setId(2L);
        mockFlight2.setAirline("Air India AI-805");
        mockFlight2.setSource("Delhi");
        mockFlight2.setDestination("Mumbai");
        mockFlight2.setDepartureTime(LocalDateTime.of(2026, 11, 2, 9, 30));
        mockFlight2.setArrivalTime(LocalDateTime.of(2026, 11, 2, 11, 45));
        mockFlight2.setPrice(new BigDecimal("5650.00"));
        mockFlight2.setAvailableSeats(18);
        mockFlight2.setActive(true);
    }

    @Test
    void testGetStatus_InitializesAndCaches() {
        when(flightRepository.findById(1L)).thenReturn(Optional.of(mockFlight1));

        FlightStatusUpdateDTO status1 = simulatorService.getStatus(1L);
        assertNotNull(status1);
        assertEquals(1L, status1.getFlightId());
        assertEquals("IndiGo 6E-204", status1.getAirline());
        assertEquals("Delhi", status1.getSource());
        assertEquals("Mumbai", status1.getDestination());
        assertNotNull(status1.getTerminal());
        assertNotNull(status1.getGate());
        assertNotNull(status1.getEstimatedArrival());

        // Second call should return cached status without re-querying repository
        FlightStatusUpdateDTO status2 = simulatorService.getStatus(1L);
        assertSame(status1, status2);
        verify(flightRepository, times(1)).findById(1L);
    }

    @Test
    void testGetBatchStatuses() {
        when(flightRepository.findById(1L)).thenReturn(Optional.of(mockFlight1));
        when(flightRepository.findById(2L)).thenReturn(Optional.of(mockFlight2));

        List<FlightStatusUpdateDTO> batch = simulatorService.getBatchStatuses(List.of(1L, 2L));
        assertEquals(2, batch.size());
        assertEquals(1L, batch.get(0).getFlightId());
        assertEquals(2L, batch.get(1).getFlightId());
    }

    @Test
    void testSimulateStatusChange_TransitionsCorrectly() {
        when(flightRepository.findById(1L)).thenReturn(Optional.of(mockFlight1));

        FlightStatusUpdateDTO initial = simulatorService.getStatus(1L);
        FlightStatusEnum prevStatus = initial.getStatus();

        FlightStatusUpdateDTO updated = simulatorService.simulateStatusChange(1L);
        assertNotNull(updated);
        assertNotNull(updated.getLastUpdatedTimestamp());

        // Status or delay or progress should have transitioned
        assertTrue(updated.getStatus() != prevStatus || updated.getDelayMinutes() > 0 || updated.getProgressPercentage() > 0);
    }
}

