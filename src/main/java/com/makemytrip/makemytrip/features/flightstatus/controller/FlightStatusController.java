package com.makemytrip.makemytrip.features.flightstatus.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.makemytrip.makemytrip.features.flightstatus.dto.BatchFlightStatusRequest;
import com.makemytrip.makemytrip.features.flightstatus.dto.FlightStatusUpdateDTO;
import com.makemytrip.makemytrip.features.flightstatus.service.FlightStatusSimulatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/flight-status")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FlightStatusController {

    private final FlightStatusSimulatorService flightStatusSimulatorService;
    private final ObjectMapper objectMapper;

    public FlightStatusController(
        FlightStatusSimulatorService flightStatusSimulatorService,
        ObjectMapper objectMapper
    ) {
        this.flightStatusSimulatorService = flightStatusSimulatorService;
        this.objectMapper = objectMapper;
    }

    /**
     * GET /api/flight-status/{flightId}
     * Returns current simulated live status for a single flight.
     */
    @GetMapping("/{flightId}")
    public ResponseEntity<FlightStatusUpdateDTO> getFlightStatus(@PathVariable Long flightId) {
        FlightStatusUpdateDTO status = flightStatusSimulatorService.getStatus(flightId);
        return ResponseEntity.ok(status);
    }

    /**
     * POST /api/flight-status/batch
     * Accepts either {"flightIds": [1, 2]} or raw array [1, 2], and returns live statuses.
     */
    @PostMapping("/batch")
    public ResponseEntity<List<FlightStatusUpdateDTO>> getBatchFlightStatuses(@RequestBody JsonNode body) {
        List<Long> ids = new ArrayList<>();
        if (body.isArray()) {
            for (JsonNode item : body) {
                if (item.isNumber()) {
                    ids.add(item.asLong());
                }
            }
        } else if (body.isObject() && body.has("flightIds") && body.get("flightIds").isArray()) {
            for (JsonNode item : body.get("flightIds")) {
                if (item.isNumber()) {
                    ids.add(item.asLong());
                }
            }
        }
        List<FlightStatusUpdateDTO> statuses = flightStatusSimulatorService.getBatchStatuses(ids);
        return ResponseEntity.ok(statuses);
    }

    /**
     * POST /api/flight-status/{flightId}/simulate-change
     * Dev/demo endpoint to force a live status transition.
     */
    @PostMapping("/{flightId}/simulate-change")
    public ResponseEntity<FlightStatusUpdateDTO> simulateStatusChange(@PathVariable Long flightId) {
        FlightStatusUpdateDTO updated = flightStatusSimulatorService.simulateStatusChange(flightId);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/flight-status/all
     * Returns simulated statuses for all active flights.
     */
    @GetMapping("/all")
    public ResponseEntity<List<FlightStatusUpdateDTO>> getAllFlightStatuses() {
        List<FlightStatusUpdateDTO> statuses = flightStatusSimulatorService.getAllSimulatedStatuses();
        return ResponseEntity.ok(statuses);
    }
}

