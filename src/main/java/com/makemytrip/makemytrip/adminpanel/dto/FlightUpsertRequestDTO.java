package com.makemytrip.makemytrip.adminpanel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FlightUpsertRequestDTO {

    private String airline;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BigDecimal price;
    private Integer availableSeats;
    private Boolean active;
    private Boolean forceScheduleUpdate;

    public FlightUpsertRequestDTO() {}

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
    public Boolean getForceScheduleUpdate() { return forceScheduleUpdate; }
    public void setForceScheduleUpdate(Boolean forceScheduleUpdate) { this.forceScheduleUpdate = forceScheduleUpdate; }
}

