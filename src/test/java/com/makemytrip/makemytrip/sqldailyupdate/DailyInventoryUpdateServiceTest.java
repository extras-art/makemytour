package com.makemytrip.makemytrip.sqldailyupdate;

import com.makemytrip.makemytrip.sqldailyupdate.dto.InventoryUpdateSummaryDTO;
import com.makemytrip.makemytrip.sqldailyupdate.event.InventoryRefreshedEvent;
import com.makemytrip.makemytrip.sqldailyupdate.service.DailyInventoryUpdateService;
import com.makemytrip.makemytrip.sqldailyupdate.service.FlightInventoryUpdateService;
import com.makemytrip.makemytrip.sqldailyupdate.service.HotelInventoryUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyInventoryUpdateServiceTest {

    @Mock
    private FlightInventoryUpdateService flightService;

    @Mock
    private HotelInventoryUpdateService hotelService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private DailyInventoryUpdateService service;

    @BeforeEach
    void setUp() {
        service = new DailyInventoryUpdateService(flightService, hotelService, eventPublisher);
    }

    @Test
    void testRunRefresh_SuccessfulRunPublishesEvent() {
        when(flightService.refreshFlightInventory()).thenReturn(
                new FlightInventoryUpdateService.FlightRefreshResult(List.of(1L), List.of(2L), List.of(3L))
        );
        when(hotelService.refreshHotelInventory()).thenReturn(List.of(10L, 11L));

        InventoryUpdateSummaryDTO summary = service.runRefresh("MANUAL");

        assertNotNull(summary);
        assertEquals("SUCCESS", summary.getStatus());
        assertEquals("MANUAL", summary.getTriggerType());
        assertEquals(1, summary.getDeactivatedFlightsCount());
        assertEquals(List.of(1L), summary.getDeactivatedFlightIds());
        assertEquals(1, summary.getNewFlightsCount());
        assertEquals(List.of(2L), summary.getNewFlightIds());
        assertEquals(1, summary.getUpdatedFlightsCount());
        assertEquals(List.of(3L), summary.getUpdatedFlightIds());
        assertEquals(2, summary.getUpdatedHotelsCount());
        assertEquals(List.of(10L, 11L), summary.getUpdatedHotelIds());

        assertFalse(service.isRunning(), "Lock must be released after run");
        assertNotNull(service.getLastExecutionTime());
        assertSame(summary, service.getLastSummary());

        ArgumentCaptor<InventoryRefreshedEvent> eventCaptor = ArgumentCaptor.forClass(InventoryRefreshedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        InventoryRefreshedEvent event = eventCaptor.getValue();
        assertEquals(List.of(1L), event.getDeactivatedFlightIds());
        assertEquals(List.of(2L), event.getNewFlightIds());
        assertEquals(List.of(3L), event.getUpdatedFlightIds());
    }

    @Test
    void testRunRefresh_ConcurrentExecutionLocking() throws Exception {
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch blockLatch = new CountDownLatch(1);

        when(flightService.refreshFlightInventory()).thenAnswer(invocation -> {
            startLatch.countDown();
            blockLatch.await(2, TimeUnit.SECONDS);
            return new FlightInventoryUpdateService.FlightRefreshResult(List.of(), List.of(), List.of());
        });

        ExecutorService executor = Executors.newFixedThreadPool(2);

        // Thread 1 acquires lock
        Future<InventoryUpdateSummaryDTO> future1 = executor.submit(() -> service.runRefresh("SCHEDULED"));

        assertTrue(startLatch.await(1, TimeUnit.SECONDS));

        // Thread 2 tries to run while Thread 1 is holding the lock
        InventoryUpdateSummaryDTO simultaneous = service.runRefresh("MANUAL");
        assertEquals("ALREADY_RUNNING", simultaneous.getStatus());

        blockLatch.countDown();
        InventoryUpdateSummaryDTO summary1 = future1.get(2, TimeUnit.SECONDS);
        assertEquals("SUCCESS", summary1.getStatus());

        executor.shutdown();
    }
}

