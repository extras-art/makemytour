package com.makemytrip.makemytrip.adminpanel.controller;

import com.makemytrip.makemytrip.adminpanel.dto.*;
import com.makemytrip.makemytrip.adminpanel.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Enterprise Admin Command Center Controller
 * All endpoints require ROLE_ADMIN.
 * Mapped to /api/admin-panel/**
 */
@RestController
@RequestMapping("/api/admin-panel")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCommandCenterController {

    private final AdminDashboardService dashboardService;
    private final AdminUserManagementService userManagementService;
    private final AdminInventoryManagementService inventoryManagementService;
    private final AdminBookingRefundService bookingRefundService;
    private final AdminAuditLogService auditLogService;

    public AdminCommandCenterController(
        AdminDashboardService dashboardService,
        AdminUserManagementService userManagementService,
        AdminInventoryManagementService inventoryManagementService,
        AdminBookingRefundService bookingRefundService,
        AdminAuditLogService auditLogService
    ) {
        this.dashboardService = dashboardService;
        this.userManagementService = userManagementService;
        this.inventoryManagementService = inventoryManagementService;
        this.bookingRefundService = bookingRefundService;
        this.auditLogService = auditLogService;
    }

    // ==================== OVERVIEW ====================

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewStatsDTO> getOverview() {
        return ResponseEntity.ok(dashboardService.buildOverview());
    }

    // ==================== USERS ====================

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> listUsers(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(userManagementService.listUsers(search, role));
    }

    @GetMapping("/users/{userId}/details")
    public ResponseEntity<AdminUserDetailDTO> getUserDetails(@PathVariable Long userId) {
        return ResponseEntity.ok(userManagementService.getUserDetail(userId));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<AdminUserDTO> updateUserRole(
        @PathVariable Long userId,
        @RequestBody Map<String, String> body,
        Authentication authentication
    ) {
        String newRole = body.get("role");
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(userManagementService.updateRole(userId, newRole, adminEmail));
    }

    // ==================== FLIGHTS ====================

    @GetMapping("/flights")
    public ResponseEntity<List<AdminFlightDTO>> listAllFlights() {
        return ResponseEntity.ok(inventoryManagementService.listAllFlights());
    }

    @PostMapping("/flights")
    public ResponseEntity<AdminFlightDTO> createFlight(
        @RequestBody FlightUpsertRequestDTO req,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(inventoryManagementService.createFlight(req, adminEmail));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<AdminFlightDTO> updateFlight(
        @PathVariable Long id,
        @RequestBody FlightUpsertRequestDTO req,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(inventoryManagementService.updateFlight(id, req, adminEmail));
    }

    @DeleteMapping("/flights/{id}")
    public ResponseEntity<Map<String, String>> deleteFlight(
        @PathVariable Long id,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(inventoryManagementService.deleteFlight(id, adminEmail));
    }

    // ==================== HOTELS ====================

    @GetMapping("/hotels")
    public ResponseEntity<List<AdminHotelDTO>> listAllHotels() {
        return ResponseEntity.ok(inventoryManagementService.listAllHotels());
    }

    @PostMapping("/hotels")
    public ResponseEntity<AdminHotelDTO> createHotel(
        @RequestBody HotelUpsertRequestDTO req,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(inventoryManagementService.createHotel(req, adminEmail));
    }

    @PutMapping("/hotels/{id}")
    public ResponseEntity<AdminHotelDTO> updateHotel(
        @PathVariable Long id,
        @RequestBody HotelUpsertRequestDTO req,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(inventoryManagementService.updateHotel(id, req, adminEmail));
    }

    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<Map<String, String>> deleteHotel(
        @PathVariable Long id,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(inventoryManagementService.deleteHotel(id, adminEmail));
    }

    // ==================== BOOKINGS & REFUNDS ====================

    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingDTO>> listBookings(
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(bookingRefundService.listBookings(status));
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public ResponseEntity<AdminBookingDTO> updateBookingStatus(
        @PathVariable Long bookingId,
        @RequestBody BookingRefundUpdateDTO dto,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        AdminBookingDTO result = bookingRefundService.updateBookingStatus(bookingId, dto);
        auditLogService.log(adminEmail, "BOOKING_STATUS_UPDATED", "BOOKING", String.valueOf(bookingId),
            "Status changed to " + dto.getNewStatus());
        return ResponseEntity.ok(result);
    }

    // ==================== AUDIT LOGS ====================

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLogDTO>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAll());
    }
}

