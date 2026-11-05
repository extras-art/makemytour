package com.makemytrip.makemytrip.adminpanel.dto;

import java.util.List;

public class AdminOverviewStatsDTO {

    private long totalUsers;
    private long totalFlights;
    private long activeFlights;
    private long inactiveFlights;
    private long totalHotels;
    private long activeHotels;
    private long inactiveHotels;
    private long totalBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long refundPendingBookings;
    private long refundedBookings;
    private List<AdminUserDTO> recentRegistrations;
    private List<AdminBookingSummaryDTO> recentBookings;
    private Object lastInventorySummary;

    public AdminOverviewStatsDTO() {}

    // ---- nested summary DTO ----
    public static class AdminBookingSummaryDTO {
        private Long id;
        private String customerName;
        private String customerEmail;
        private String type; // FLIGHT or HOTEL
        private String entityName;
        private Double totalPrice;
        private String status;
        private String createdAt;

        public AdminBookingSummaryDTO() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getEntityName() { return entityName; }
        public void setEntityName(String entityName) { this.entityName = entityName; }
        public Double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalFlights() { return totalFlights; }
    public void setTotalFlights(long totalFlights) { this.totalFlights = totalFlights; }
    public long getActiveFlights() { return activeFlights; }
    public void setActiveFlights(long activeFlights) { this.activeFlights = activeFlights; }
    public long getInactiveFlights() { return inactiveFlights; }
    public void setInactiveFlights(long inactiveFlights) { this.inactiveFlights = inactiveFlights; }
    public long getTotalHotels() { return totalHotels; }
    public void setTotalHotels(long totalHotels) { this.totalHotels = totalHotels; }
    public long getActiveHotels() { return activeHotels; }
    public void setActiveHotels(long activeHotels) { this.activeHotels = activeHotels; }
    public long getInactiveHotels() { return inactiveHotels; }
    public void setInactiveHotels(long inactiveHotels) { this.inactiveHotels = inactiveHotels; }
    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }
    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
    public long getRefundPendingBookings() { return refundPendingBookings; }
    public void setRefundPendingBookings(long refundPendingBookings) { this.refundPendingBookings = refundPendingBookings; }
    public long getRefundedBookings() { return refundedBookings; }
    public void setRefundedBookings(long refundedBookings) { this.refundedBookings = refundedBookings; }
    public List<AdminUserDTO> getRecentRegistrations() { return recentRegistrations; }
    public void setRecentRegistrations(List<AdminUserDTO> recentRegistrations) { this.recentRegistrations = recentRegistrations; }
    public List<AdminBookingSummaryDTO> getRecentBookings() { return recentBookings; }
    public void setRecentBookings(List<AdminBookingSummaryDTO> recentBookings) { this.recentBookings = recentBookings; }
    public Object getLastInventorySummary() { return lastInventorySummary; }
    public void setLastInventorySummary(Object lastInventorySummary) { this.lastInventorySummary = lastInventorySummary; }
}

