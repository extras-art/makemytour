package com.makemytrip.makemytrip.adminpanel.dto;

import com.makemytrip.makemytrip.models.Flight;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminFlightDTO {

    private Long id;
    private String airline;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BigDecimal price;
    private Integer availableSeats;
    private Boolean active;
    private long bookingCount;
    private boolean hasActiveBookings;

    public AdminFlightDTO() {}

    public static AdminFlightDTO from(Flight f, long bookingCount, int reservedSeats) {
        AdminFlightDTO dto = new AdminFlightDTO();
        dto.setId(f.getId());
        dto.setAirline(f.getAirline());
        dto.setSource(f.getSource());
        dto.setDestination(f.getDestination());
        dto.setDepartureTime(f.getDepartureTime());
        dto.setArrivalTime(f.getArrivalTime());
        dto.setPrice(f.getPrice());
        dto.setAvailableSeats(f.getAvailableSeats());
        dto.setActive(f.getActive());
        dto.setBookingCount(bookingCount);
        dto.setHasActiveBookings(reservedSeats > 0);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAirline() { return airline; }
    public void setAirline(String airline) { this.airline = airline; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }
    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public long getBookingCount() { return bookingCount; }
    public void setBookingCount(long bookingCount) { this.bookingCount = bookingCount; }
    public boolean isHasActiveBookings() { return hasActiveBookings; }
    public void setHasActiveBookings(boolean hasActiveBookings) { this.hasActiveBookings = hasActiveBookings; }
}

