package com.makemytrip.makemytrip.dto;

import jakarta.validation.constraints.Min;
import java.time.LocalDate;

public class CreateBookingRequestDto {

    private Long userId;
    private Long flightId;
    private Long hotelId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    private Integer nights = 1;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String idempotencyKey;

    public CreateBookingRequestDto() {
    }

    public CreateBookingRequestDto(
            Long userId,
            Long flightId,
            Long hotelId,
            Integer quantity,
            Integer nights,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            String idempotencyKey) {
        this.userId = userId;
        this.flightId = flightId;
        this.hotelId = hotelId;
        this.quantity = quantity != null ? quantity : 1;
        this.nights = nights != null ? nights : 1;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.idempotencyKey = idempotencyKey;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getFlightId() {
        return flightId;
    }

    public void setFlightId(Long flightId) {
        this.flightId = flightId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public Integer getQuantity() {
        return quantity != null ? quantity : 1;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getNights() {
        return nights != null ? nights : 1;
    }

    public void setNights(Integer nights) {
        this.nights = nights;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}
