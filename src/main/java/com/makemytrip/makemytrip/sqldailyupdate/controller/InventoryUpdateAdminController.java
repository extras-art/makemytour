package com.makemytrip.makemytrip.sqldailyupdate.controller;

import com.makemytrip.makemytrip.sqldailyupdate.dto.InventoryUpdateSummaryDTO;
import com.makemytrip.makemytrip.sqldailyupdate.service.DailyInventoryUpdateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory-refresh")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class InventoryUpdateAdminController {

    private final DailyInventoryUpdateService dailyInventoryUpdateService;

    public InventoryUpdateAdminController(DailyInventoryUpdateService dailyInventoryUpdateService) {
        this.dailyInventoryUpdateService = dailyInventoryUpdateService;
    }

    /**
     * POST /api/admin/inventory-refresh/run
     * Manually triggers daily inventory refresh.
     */
    @PostMapping("/run")
    public ResponseEntity<InventoryUpdateSummaryDTO> triggerManualRefresh() {
        InventoryUpdateSummaryDTO summary = dailyInventoryUpdateService.runRefresh("MANUAL");
        if ("ALREADY_RUNNING".equals(summary.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(summary);
        }
        return ResponseEntity.ok(summary);
    }

    /**
     * GET /api/admin/inventory-refresh/status
     * Returns the execution state, last timestamp, and last summary.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getRefreshStatus() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("running", dailyInventoryUpdateService.isRunning());
        response.put("lastExecutionTime", dailyInventoryUpdateService.getLastExecutionTime());
        response.put("lastSummary", dailyInventoryUpdateService.getLastSummary());
        return ResponseEntity.ok(response);
    }
}

