package com.makemytrip.makemytrip.sqldailyupdate.service;

import com.makemytrip.makemytrip.sqldailyupdate.dto.InventoryUpdateSummaryDTO;
import com.makemytrip.makemytrip.sqldailyupdate.event.InventoryRefreshedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class DailyInventoryUpdateService {

    private static final Logger log = LoggerFactory.getLogger(DailyInventoryUpdateService.class);

    private final FlightInventoryUpdateService flightInventoryUpdateService;
    private final HotelInventoryUpdateService hotelInventoryUpdateService;
    private final ApplicationEventPublisher eventPublisher;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private volatile LocalDateTime lastExecutionTime;
    private volatile InventoryUpdateSummaryDTO lastSummary;

    public DailyInventoryUpdateService(
        FlightInventoryUpdateService flightInventoryUpdateService,
        HotelInventoryUpdateService hotelInventoryUpdateService,
        ApplicationEventPublisher eventPublisher
    ) {
        this.flightInventoryUpdateService = flightInventoryUpdateService;
        this.hotelInventoryUpdateService = hotelInventoryUpdateService;
        this.eventPublisher = eventPublisher;
    }

    public boolean isRunning() {
        return isRunning.get();
    }

    public LocalDateTime getLastExecutionTime() {
        return lastExecutionTime;
    }

    public InventoryUpdateSummaryDTO getLastSummary() {
        return lastSummary;
    }

    /**
     * Executes the full inventory refresh workflow with an AtomicBoolean concurrency lock.
     * Prevents concurrent runs between scheduler cron and admin manual triggers.
     */
    public InventoryUpdateSummaryDTO runRefresh(String triggerType) {
        if (!isRunning.compareAndSet(false, true)) {
            log.warn("Inventory update requested via {} but another update is currently executing.", triggerType);
            InventoryUpdateSummaryDTO busy = new InventoryUpdateSummaryDTO();
            busy.setTriggerType(triggerType);
            busy.setExecutedAt(LocalDateTime.now());
            busy.setStatus("ALREADY_RUNNING");
            busy.setMessage("An inventory update is already running. Concurrency lock acquired by another process.");
            return busy;
        }

        long startTime = System.currentTimeMillis();
        LocalDateTime executedAt = LocalDateTime.now();
        log.info("Starting Daily Inventory Refresh [Trigger: {}] at {}", triggerType, executedAt);

        try {
            InventoryUpdateSummaryDTO summary = executeRefreshTransactional(triggerType, executedAt);
            long durationMs = System.currentTimeMillis() - startTime;
            summary.setExecutionDurationMs(durationMs);

            this.lastExecutionTime = executedAt;
            this.lastSummary = summary;

            log.info("Completed Daily Inventory Refresh [Trigger: {}] in {} ms: {} deactivated flights, {} new flights, {} updated flights, {} updated hotels.",
                    triggerType, durationMs,
                    summary.getDeactivatedFlightsCount(),
                    summary.getNewFlightsCount(),
                    summary.getUpdatedFlightsCount(),
                    summary.getUpdatedHotelsCount());

            return summary;
        } catch (Exception e) {
            long durationMs = System.currentTimeMillis() - startTime;
            log.error("Error occurred during Daily Inventory Refresh: {}", e.getMessage(), e);

            InventoryUpdateSummaryDTO failed = new InventoryUpdateSummaryDTO();
            failed.setTriggerType(triggerType);
            failed.setExecutedAt(executedAt);
            failed.setExecutionDurationMs(durationMs);
            failed.setStatus("FAILED");
            failed.setMessage("Inventory update failed: " + e.getMessage());

            this.lastSummary = failed;
            return failed;
        } finally {
            isRunning.set(false);
        }
    }

    @Transactional
    public InventoryUpdateSummaryDTO executeRefreshTransactional(String triggerType, LocalDateTime executedAt) {
        FlightInventoryUpdateService.FlightRefreshResult flightResult =
                flightInventoryUpdateService.refreshFlightInventory();

        List<Long> updatedHotels = hotelInventoryUpdateService.refreshHotelInventory();

        InventoryUpdateSummaryDTO summary = new InventoryUpdateSummaryDTO();
        summary.setTriggerType(triggerType);
        summary.setExecutedAt(executedAt);

        summary.setDeactivatedFlightIds(flightResult.getDeactivatedFlightIds());
        summary.setDeactivatedFlightsCount(flightResult.getDeactivatedFlightIds().size());

        summary.setNewFlightIds(flightResult.getNewFlightIds());
        summary.setNewFlightsCount(flightResult.getNewFlightIds().size());

        summary.setUpdatedFlightIds(flightResult.getUpdatedFlightIds());
        summary.setUpdatedFlightsCount(flightResult.getUpdatedFlightIds().size());

        summary.setUpdatedHotelIds(updatedHotels);
        summary.setUpdatedHotelsCount(updatedHotels.size());

        summary.setStatus("SUCCESS");
        summary.setMessage("Daily inventory refresh completed successfully.");

        // Publish decoupled Spring ApplicationEvent
        eventPublisher.publishEvent(new InventoryRefreshedEvent(
                this,
                flightResult.getDeactivatedFlightIds(),
                flightResult.getNewFlightIds(),
                flightResult.getUpdatedFlightIds()
        ));

        return summary;
    }
}

