package com.makemytrip.makemytrip.dto;

import com.makemytrip.makemytrip.models.Booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponseDto {

    private Long id;
    private UserResponseDto user;
    private FlightDto flight;
    private HotelDto hotel;
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
    private String idempotencyKey;
    private LocalDateTime createdAt;
    private LocalDateTime cancelledAt;

    public BookingResponseDto() {}

    public static BookingResponseDto fromEntity(Booking booking) {
        if (booking == null) return null;
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setUser(UserResponseDto.fromEntity(booking.getUser()));
        dto.setFlight(FlightDto.fromEntity(booking.getFlight()));
        dto.setHotel(HotelDto.fromEntity(booking.getHotel()));
        dto.setQuantity(booking.getQuantity());
        dto.setNights(booking.getNights());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setUnitPriceSnapshot(booking.getUnitPriceSnapshot());
        dto.setTaxesAndFees(booking.getTaxesAndFees());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setCurrency(booking.getCurrency());
        dto.setStatus(booking.getStatus());
        dto.setPaymentStatus(booking.getPaymentStatus());
        dto.setIdempotencyKey(booking.getIdempotencyKey());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setCancelledAt(booking.getCancelledAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserResponseDto getUser() { return user; }
    public void setUser(UserResponseDto user) { this.user = user; }

    public FlightDto getFlight() { return flight; }
    public void setFlight(FlightDto flight) { this.flight = flight; }

    public HotelDto getHotel() { return hotel; }
    public void setHotel(HotelDto hotel) { this.hotel = hotel; }

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

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
