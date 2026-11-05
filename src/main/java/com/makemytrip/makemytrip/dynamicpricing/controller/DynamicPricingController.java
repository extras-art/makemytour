package com.makemytrip.makemytrip.dynamicpricing.controller;

import com.makemytrip.makemytrip.dynamicpricing.dto.BatchBreakdownRequestDTO;
import com.makemytrip.makemytrip.dynamicpricing.dto.PriceBreakdownDTO;
import com.makemytrip.makemytrip.dynamicpricing.dto.PriceLockResponseDTO;
import com.makemytrip.makemytrip.dynamicpricing.model.EntityType;
import com.makemytrip.makemytrip.dynamicpricing.model.PriceHistoryEntry;
import com.makemytrip.makemytrip.dynamicpricing.repository.PriceHistoryRepository;
import com.makemytrip.makemytrip.dynamicpricing.service.DynamicPricingEngineService;
import com.makemytrip.makemytrip.dynamicpricing.service.PriceFreezeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pricing")
@CrossOrigin
public class DynamicPricingController {

    private final DynamicPricingEngineService dynamicPricingEngineService;
    private final PriceFreezeService priceFreezeService;
    private final PriceHistoryRepository priceHistoryRepository;

    public DynamicPricingController(DynamicPricingEngineService dynamicPricingEngineService,
                                    PriceFreezeService priceFreezeService,
                                    PriceHistoryRepository priceHistoryRepository) {
        this.dynamicPricingEngineService = dynamicPricingEngineService;
        this.priceFreezeService = priceFreezeService;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @GetMapping("/{entityType}/{entityId}/breakdown")
    public ResponseEntity<PriceBreakdownDTO> getBreakdown(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        EntityType type = EntityType.valueOf(entityType.toUpperCase());
        return ResponseEntity.ok(dynamicPricingEngineService.computeBreakdown(type, entityId));
    }

    @GetMapping("/{entityType}/{entityId}/history")
    public ResponseEntity<List<PriceHistoryEntry>> getHistory(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        EntityType type = EntityType.valueOf(entityType.toUpperCase());
        List<PriceHistoryEntry> history = priceHistoryRepository.findByEntityTypeAndEntityIdOrderByRecordedAtAsc(type, entityId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/batch-breakdown")
    public ResponseEntity<List<PriceBreakdownDTO>> getBatchBreakdown(@RequestBody BatchBreakdownRequestDTO request) {
        if (request == null || request.getEntityIds() == null || request.getEntityType() == null) {
            return ResponseEntity.badRequest().build();
        }

        EntityType type = EntityType.valueOf(request.getEntityType().toUpperCase());
        List<PriceBreakdownDTO> results = new ArrayList<>();
        for (Long id : request.getEntityIds()) {
            try {
                results.add(dynamicPricingEngineService.computeBreakdown(type, id));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(results);
    }

    @PostMapping("/lock")
    public ResponseEntity<PriceLockResponseDTO> lockPrice(@RequestBody Map<String, Object> body) {
        if (!body.containsKey("userId") || !body.containsKey("entityType") || !body.containsKey("entityId")) {
            return ResponseEntity.badRequest().build();
        }

        Long userId = Long.valueOf(body.get("userId").toString());
        EntityType type = EntityType.valueOf(body.get("entityType").toString().toUpperCase());
        Long entityId = Long.valueOf(body.get("entityId").toString());

        return ResponseEntity.ok(priceFreezeService.createLock(userId, type, entityId));
    }

    @GetMapping("/lock/active")
    public ResponseEntity<PriceLockResponseDTO> getActiveLock(
            @RequestParam Long userId,
            @RequestParam String entityType,
            @RequestParam Long entityId) {
        EntityType type = EntityType.valueOf(entityType.toUpperCase());
        return priceFreezeService.getActiveLock(userId, type, entityId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/{entityType}/{entityId}/simulate-surge")
    public ResponseEntity<PriceBreakdownDTO> simulateSurge(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        EntityType type = EntityType.valueOf(entityType.toUpperCase());
        return ResponseEntity.ok(dynamicPricingEngineService.simulateSurge(type, entityId));
    }
}

