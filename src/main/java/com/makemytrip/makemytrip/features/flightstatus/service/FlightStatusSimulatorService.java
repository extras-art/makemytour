package com.makemytrip.makemytrip.features.flightstatus.service;

import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.features.flightstatus.dto.FlightStatusUpdateDTO;
import com.makemytrip.makemytrip.features.flightstatus.model.FlightStatusEnum;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.sqldailyupdate.event.InventoryRefreshedEvent;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FlightStatusSimulatorService {

    private final FlightRepository flightRepository;
    private final ConcurrentHashMap<Long, FlightStatusUpdateDTO> statusCache = new ConcurrentHashMap<>();

    private static final String[] DELAY_REASONS = {
        "Air traffic congestion at origin",
        "Late incoming aircraft",
        "Adverse weather conditions",
        "Technical safety inspection"
    };

    public FlightStatusSimulatorService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    @PostConstruct
    public void initCatalog() {
        try {
            List<Flight> activeFlights = flightRepository.findByActiveTrue();
            for (Flight flight : activeFlights) {
                if (flight.getId() != null) {
                    statusCache.computeIfAbsent(flight.getId(), this::initializeFlightStatus);
                }
            }
        } catch (Exception ignored) {
            // Safe fallback during context bootstrapping or test runners
        }
    }

    /**
     * Decoupled Spring Event Listener receiving daily inventory refresh notifications.
     * TransactionalEventListener AFTER_COMMIT guarantees DB changes have committed.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleInventoryRefreshed(InventoryRefreshedEvent event) {
        if (event == null) return;

        // 1. Deactivated IDs: Remove from active simulator catalog
        for (Long deactivatedId : event.getDeactivatedFlightIds()) {
            if (deactivatedId != null) {
                statusCache.remove(deactivatedId);
            }
        }

        // 2. New IDs: Load from FlightRepository and initialize fresh ON_TIME simulator states
        for (Long newId : event.getNewFlightIds()) {
            if (newId != null) {
                flightRepository.findById(newId).ifPresent(flight -> {
                    if (Boolean.TRUE.equals(flight.getActive())) {
                        FlightStatusUpdateDTO dto = buildFreshOnTimeStatus(flight);
                        statusCache.put(flight.getId(), dto);
                    }
                });
            }
        }

        // 3. Existing Active IDs: Preserve current simulated states (DELAYED, BOARDING, IN_AIR, LANDED) and delay reasons.
        // If an unbooked flight's base schedule shifted and status is ON_TIME or DELAYED,
        // recalculate revisedDeparture and estimatedArrival cleanly without triggering false push notifications.
        for (Long updatedId : event.getUpdatedFlightIds()) {
            if (updatedId != null) {
                FlightStatusUpdateDTO existing = statusCache.get(updatedId);
                if (existing != null) {
                    flightRepository.findById(updatedId).ifPresent(flight -> {
                        existing.setOriginalDeparture(flight.getDepartureTime());
                        existing.setOriginalArrival(flight.getArrivalTime());
                        if (existing.getStatus() == FlightStatusEnum.ON_TIME || existing.getStatus() == FlightStatusEnum.DELAYED) {
                            int delay = existing.getDelayMinutes();
                            existing.setRevisedDeparture(flight.getDepartureTime() != null ? flight.getDepartureTime().plusMinutes(delay) : null);
                            existing.setEstimatedArrival(flight.getArrivalTime() != null ? flight.getArrivalTime().plusMinutes(delay) : null);
                        }
                        existing.setLastUpdatedTimestamp(LocalDateTime.now());
                    });
                }
            }
        }
    }

    private FlightStatusUpdateDTO buildFreshOnTimeStatus(Flight flight) {
        FlightStatusUpdateDTO dto = new FlightStatusUpdateDTO();
        dto.setFlightId(flight.getId());
        dto.setAirline(flight.getAirline());
        dto.setSource(flight.getSource());
        dto.setDestination(flight.getDestination());

        LocalDateTime departure = flight.getDepartureTime() != null ? flight.getDepartureTime() : LocalDateTime.now().plusHours(2);
        LocalDateTime arrival = flight.getArrivalTime() != null ? flight.getArrivalTime() : departure.plusHours(2).plusMinutes(15);

        dto.setOriginalDeparture(departure);
        dto.setOriginalArrival(arrival);
        dto.setRevisedDeparture(departure);
        dto.setEstimatedArrival(arrival);

        long id = flight.getId() != null ? flight.getId() : 1L;
        String terminal = "T" + ((id % 3) + 1);
        char gateLetter = (char) ('A' + (id % 4));
        int gateNumber = (int) ((id * 3) % 20 + 1);
        String gate = "Gate " + gateLetter + gateNumber;

        dto.setTerminal(terminal);
        dto.setGate(gate);
        dto.setStatus(FlightStatusEnum.ON_TIME);
        dto.setStatusDisplay("On Time");
        dto.setDelayMinutes(0);
        dto.setDelayReason(null);
        dto.setProgressPercentage(0);
        dto.setLastUpdatedTimestamp(LocalDateTime.now());
        return dto;
    }

    /**
     * Retrieve status for a single flight.
     * Uses in-memory cached state or lazily initializes from DB schedule.
     */
    public FlightStatusUpdateDTO getStatus(Long flightId) {
        return statusCache.computeIfAbsent(flightId, this::initializeFlightStatus);
    }

    /**
     * Retrieve status updates for multiple flights in batch.
     */
    public List<FlightStatusUpdateDTO> getBatchStatuses(List<Long> flightIds) {
        if (flightIds == null || flightIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<FlightStatusUpdateDTO> result = new ArrayList<>();
        for (Long id : flightIds) {
            if (id != null) {
                try {
                    result.add(getStatus(id));
                } catch (ResourceNotFoundException ignored) {
                    // Skip invalid / not-found / deactivated flight ids gracefully
                }
            }
        }
        return result;
    }

    /**
     * Retrieve all active flight statuses.
     */
    public List<FlightStatusUpdateDTO> getAllSimulatedStatuses() {
        List<Flight> activeFlights = flightRepository.findByActiveTrue();
        List<FlightStatusUpdateDTO> statuses = new ArrayList<>();
        for (Flight flight : activeFlights) {
            try {
                statuses.add(getStatus(flight.getId()));
            } catch (ResourceNotFoundException ignored) {
            }
        }
        return statuses;
    }

    /**
     * Demo / Dev trigger: Force a live state transition for the given flight.
     */
    public FlightStatusUpdateDTO simulateStatusChange(Long flightId) {
        FlightStatusUpdateDTO current = getStatus(flightId);

        FlightStatusEnum currentStatus = current.getStatus();
        FlightStatusEnum newStatus;
        int newDelay = current.getDelayMinutes();
        String newReason = current.getDelayReason();
        int newProgress = current.getProgressPercentage();
        String newDisplay;

        switch (currentStatus) {
            case ON_TIME:
                // Shift to Delayed by 45m or 1h
                newStatus = FlightStatusEnum.DELAYED;
                newDelay = 60;
                newReason = DELAY_REASONS[(int) (flightId % DELAY_REASONS.length)];
                newProgress = 0;
                newDisplay = "Delayed by 1h";
                break;

            case DELAYED:
                if (newDelay < 90) {
                    // Extend delay to 1h 30m
                    newStatus = FlightStatusEnum.DELAYED;
                    newDelay = 90;
                    newReason = "Adverse weather conditions";
                    newProgress = 0;
                    newDisplay = "Delayed by 1h 30m";
                } else {
                    // Recover from delay and enter boarding
                    newStatus = FlightStatusEnum.BOARDING;
                    newReason = null;
                    newProgress = 15;
                    newDisplay = "Boarding (" + current.getGate() + ")";
                }
                break;

            case BOARDING:
                // Take off into the air
                newStatus = FlightStatusEnum.IN_AIR;
                newDelay = 0;
                newReason = null;
                newProgress = 48;
                newDisplay = "In Air - Cruising at 34,000 ft";
                break;

            case IN_AIR:
                if (newProgress < 80) {
                    // Approaching destination
                    newStatus = FlightStatusEnum.IN_AIR;
                    newProgress = 85;
                    newDisplay = "In Air - Approaching Destination";
                } else {
                    // Landed
                    newStatus = FlightStatusEnum.LANDED;
                    newProgress = 100;
                    newDisplay = "Landed (Baggage Belt " + ((flightId % 6) + 1) + ")";
                }
                break;

            case LANDED:
            default:
                // Reset to on-time for the next leg
                newStatus = FlightStatusEnum.ON_TIME;
                newDelay = 0;
                newReason = null;
                newProgress = 0;
                newDisplay = "On Time";
                break;
        }

        current.setStatus(newStatus);
        current.setDelayMinutes(newDelay);
        current.setDelayReason(newReason);
        current.setStatusDisplay(newDisplay);
        current.setProgressPercentage(newProgress);

        LocalDateTime origDep = current.getOriginalDeparture();
        LocalDateTime origArr = current.getOriginalArrival();

        current.setRevisedDeparture(origDep != null ? origDep.plusMinutes(newDelay) : null);
        current.setEstimatedArrival(origArr != null ? origArr.plusMinutes(newDelay) : null);
        current.setLastUpdatedTimestamp(LocalDateTime.now());

        statusCache.put(flightId, current);
        return current;
    }

    /**
     * Initializes simulated status data from DB flight entity without modifying the DB.
     */
    private FlightStatusUpdateDTO initializeFlightStatus(Long flightId) {
        Flight flight = flightRepository.findById(flightId)
            .orElseThrow(() -> new ResourceNotFoundException("Flight not found with id: " + flightId));

        if (Boolean.FALSE.equals(flight.getActive())) {
            throw new ResourceNotFoundException("Flight is deactivated with id: " + flightId);
        }

        FlightStatusUpdateDTO dto = new FlightStatusUpdateDTO();
        dto.setFlightId(flight.getId());
        dto.setAirline(flight.getAirline());
        dto.setSource(flight.getSource());
        dto.setDestination(flight.getDestination());

        LocalDateTime departure = flight.getDepartureTime();
        LocalDateTime arrival = flight.getArrivalTime();

        if (departure == null) {
            departure = LocalDateTime.now().plusHours(2);
        }
        if (arrival == null) {
            arrival = departure.plusHours(2).plusMinutes(15);
        }

        dto.setOriginalDeparture(departure);
        dto.setOriginalArrival(arrival);

        String terminal = "T" + ((flightId % 3) + 1);
        char gateLetter = (char) ('A' + (flightId % 4));
        int gateNumber = (int) ((flightId * 3) % 20 + 1);
        String gate = "Gate " + gateLetter + gateNumber;

        dto.setTerminal(terminal);
        dto.setGate(gate);

        // Deterministic realistic initial state based on flight ID
        int pattern = (int) (flightId % 5);
        int delay = 0;
        String reason = null;
        int progress = 0;
        FlightStatusEnum status;
        String display;

        switch (pattern) {
            case 1:
                status = FlightStatusEnum.BOARDING;
                display = "Boarding (" + gate + ")";
                progress = 10;
                break;
            case 2:
                status = FlightStatusEnum.DELAYED;
                delay = 45;
                reason = DELAY_REASONS[0];
                display = "Delayed by 45m";
                break;
            case 3:
                status = FlightStatusEnum.IN_AIR;
                display = "In Air - On Schedule";
                progress = 58;
                break;
            case 4:
                status = FlightStatusEnum.DELAYED;
                delay = 80;
                reason = DELAY_REASONS[1];
                display = "Delayed by 1h 20m";
                break;
            case 0:
            default:
                status = FlightStatusEnum.ON_TIME;
                display = "On Time";
                progress = 0;
                break;
        }

        dto.setStatus(status);
        dto.setDelayMinutes(delay);
        dto.setDelayReason(reason);
        dto.setStatusDisplay(display);
        dto.setProgressPercentage(progress);

        dto.setRevisedDeparture(departure.plusMinutes(delay));
        dto.setEstimatedArrival(arrival.plusMinutes(delay));
        dto.setLastUpdatedTimestamp(LocalDateTime.now());

        return dto;
    }
}

