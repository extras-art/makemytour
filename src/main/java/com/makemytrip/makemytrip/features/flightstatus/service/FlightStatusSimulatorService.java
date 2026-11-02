package com.makemytrip.makemytrip.features.flightstatus.service;

import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.features.flightstatus.dto.FlightStatusUpdateDTO;
import com.makemytrip.makemytrip.features.flightstatus.model.FlightStatusEnum;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import org.springframework.stereotype.Service;

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
                    // Skip invalid / not-found flight ids gracefully
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
            statuses.add(getStatus(flight.getId()));
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

