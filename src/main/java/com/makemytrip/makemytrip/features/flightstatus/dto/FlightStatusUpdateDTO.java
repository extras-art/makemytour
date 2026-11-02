package com.makemytrip.makemytrip.features.flightstatus.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.makemytrip.makemytrip.features.flightstatus.model.FlightStatusEnum;

import java.time.LocalDateTime;

public class FlightStatusUpdateDTO {

    private Long flightId;
    private String airline;
    private String source;
    private String destination;
    private FlightStatusEnum status;
    private String statusDisplay;
    private String terminal;
    private String gate;
    private int delayMinutes;
    private String delayReason;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime originalDeparture;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime revisedDeparture;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime originalArrival;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime estimatedArrival;

    private int progressPercentage;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUpdatedTimestamp;

    public FlightStatusUpdateDTO() {}

    public Long getFlightId() {
        return flightId;
    }

    public void setFlightId(Long flightId) {
        this.flightId = flightId;
    }

    public String getAirline() {
        return airline;
    }

    public void setAirline(String airline) {
        this.airline = airline;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public FlightStatusEnum getStatus() {
        return status;
    }

    public void setStatus(FlightStatusEnum status) {
        this.status = status;
    }

    public String getStatusDisplay() {
        return statusDisplay;
    }

    public void setStatusDisplay(String statusDisplay) {
        this.statusDisplay = statusDisplay;
    }

    public String getTerminal() {
        return terminal;
    }

    public void setTerminal(String terminal) {
        this.terminal = terminal;
    }

    public String getGate() {
        return gate;
    }

    public void setGate(String gate) {
        this.gate = gate;
    }

    public int getDelayMinutes() {
        return delayMinutes;
    }

    public void setDelayMinutes(int delayMinutes) {
        this.delayMinutes = delayMinutes;
    }

    public String getDelayReason() {
        return delayReason;
    }

    public void setDelayReason(String delayReason) {
        this.delayReason = delayReason;
    }

    public LocalDateTime getOriginalDeparture() {
        return originalDeparture;
    }

    public void setOriginalDeparture(LocalDateTime originalDeparture) {
        this.originalDeparture = originalDeparture;
    }

    public LocalDateTime getRevisedDeparture() {
        return revisedDeparture;
    }

    public void setRevisedDeparture(LocalDateTime revisedDeparture) {
        this.revisedDeparture = revisedDeparture;
    }

    public LocalDateTime getOriginalArrival() {
        return originalArrival;
    }

    public void setOriginalArrival(LocalDateTime originalArrival) {
        this.originalArrival = originalArrival;
    }

    public LocalDateTime getEstimatedArrival() {
        return estimatedArrival;
    }

    public void setEstimatedArrival(LocalDateTime estimatedArrival) {
        this.estimatedArrival = estimatedArrival;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getLastUpdatedTimestamp() {
        return lastUpdatedTimestamp;
    }

    public void setLastUpdatedTimestamp(LocalDateTime lastUpdatedTimestamp) {
        this.lastUpdatedTimestamp = lastUpdatedTimestamp;
    }
}

