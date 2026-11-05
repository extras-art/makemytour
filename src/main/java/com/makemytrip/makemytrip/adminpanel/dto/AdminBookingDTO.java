package com.makemytrip.makemytrip.adminpanel.dto;

import com.makemytrip.makemytrip.models.Booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AdminBookingDTO {

    private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String type; // "FLIGHT" or "HOTEL"
    private Long entityId;
    private String entityName;
    private Integer quantity;
    private Integer nights;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BigDecimal unitPriceSnapshot;
    private BigDecimal taxesAndFees;
    private BigDecimal totalPrice;
    private String currency;
    private String status;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime cancelledAt;

    public AdminBookingDTO() {}

    public static AdminBookingDTO from(Booking b) {
        AdminBookingDTO dto = new AdminBookingDTO();
        dto.setId(b.getId());
        if (b.getUser() != null) {
            dto.setUserId(b.getUser().getId());
            dto.setCustomerName(b.getUser().getName());
            dto.setCustomerEmail(b.getUser().getEmail());
        }
        if (b.getFlight() != null) {
            dto.setType("FLIGHT");
            dto.setEntityId(b.getFlight().getId());
            dto.setEntityName(b.getFlight().getAirline() + " (" + b.getFlight().getSource() + " → " + b.getFlight().getDestination() + ")");
        } else if (b.getHotel() != null) {
            dto.setType("HOTEL");
            dto.setEntityId(b.getHotel().getId());
            dto.setEntityName(b.getHotel().getName() + ", " + b.getHotel().getCity());
        }
        dto.setQuantity(b.getQuantity());
        dto.setNights(b.getNights());
        dto.setCheckInDate(b.getCheckInDate());
        dto.setCheckOutDate(b.getCheckOutDate());
        dto.setUnitPriceSnapshot(b.getUnitPriceSnapshot());
        dto.setTaxesAndFees(b.getTaxesAndFees());
        dto.setTotalPrice(b.getTotalPrice());
        dto.setCurrency(b.getCurrency());
        dto.setStatus(b.getStatus());
        dto.setPaymentStatus(b.getPaymentStatus());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setCancelledAt(b.getCancelledAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getNights() { return nights; }
    public void setNights(Integer nights) { this.nights = nights; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
    public BigDecimal getUnitPriceSnapshot() { return unitPriceSnapshot; }
    public void setUnitPriceSnapshot(BigDecimal unitPriceSnapshot) { this.unitPriceSnapshot = unitPriceSnapshot; }
    public BigDecimal getTaxesAndFees() { return taxesAndFees; }
    public void setTaxesAndFees(BigDecimal taxesAndFees) { this.taxesAndFees = taxesAndFees; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}

