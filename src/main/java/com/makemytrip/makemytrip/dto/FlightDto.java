package com.makemytrip.makemytrip.dto;

import com.makemytrip.makemytrip.models.Flight;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FlightDto {

    private Long id;
    private String airline;
    private String flightName;
    private String source;
    private String from;
    private String destination;
    private String to;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BigDecimal price;
    private Integer availableSeats;
    private Boolean active;

    public FlightDto() {}

    public static FlightDto fromEntity(Flight flight) {
        if (flight == null) return null;
        FlightDto dto = new FlightDto();
        dto.setId(flight.getId());
        dto.setAirline(flight.getAirline());
        dto.setFlightName(flight.getAirline());
        dto.setSource(flight.getSource());
        dto.setFrom(flight.getSource());
        dto.setDestination(flight.getDestination());
        dto.setTo(flight.getDestination());
        dto.setDepartureTime(flight.getDepartureTime());
        dto.setArrivalTime(flight.getArrivalTime());
        dto.setPrice(flight.getPrice());
        dto.setAvailableSeats(flight.getAvailableSeats());
        dto.setActive(flight.getActive());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAirline() { return airline; }
    public void setAirline(String airline) { this.airline = airline; }

    public String getFlightName() { return flightName; }
    public void setFlightName(String flightName) { this.flightName = flightName; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

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
}
