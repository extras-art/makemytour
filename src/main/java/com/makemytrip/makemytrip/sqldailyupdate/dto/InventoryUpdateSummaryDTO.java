package com.makemytrip.makemytrip.sqldailyupdate.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class InventoryUpdateSummaryDTO {

    private String triggerType;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime executedAt;

    private long executionDurationMs;

    private int deactivatedFlightsCount;
    private List<Long> deactivatedFlightIds = new ArrayList<>();

    private int newFlightsCount;
    private List<Long> newFlightIds = new ArrayList<>();

    private int updatedFlightsCount;
    private List<Long> updatedFlightIds = new ArrayList<>();

    private int updatedHotelsCount;
    private List<Long> updatedHotelIds = new ArrayList<>();

    private String status;
    private String message;

    public InventoryUpdateSummaryDTO() {}

    public String getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(String triggerType) {
        this.triggerType = triggerType;
    }

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }

    public long getExecutionDurationMs() {
        return executionDurationMs;
    }

    public void setExecutionDurationMs(long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }

    public int getDeactivatedFlightsCount() {
        return deactivatedFlightsCount;
    }

    public void setDeactivatedFlightsCount(int deactivatedFlightsCount) {
        this.deactivatedFlightsCount = deactivatedFlightsCount;
    }

    public List<Long> getDeactivatedFlightIds() {
        return deactivatedFlightIds;
    }

    public void setDeactivatedFlightIds(List<Long> deactivatedFlightIds) {
        this.deactivatedFlightIds = deactivatedFlightIds != null ? deactivatedFlightIds : new ArrayList<>();
    }

    public int getNewFlightsCount() {
        return newFlightsCount;
    }

    public void setNewFlightsCount(int newFlightsCount) {
        this.newFlightsCount = newFlightsCount;
    }

    public List<Long> getNewFlightIds() {
        return newFlightIds;
    }

    public void setNewFlightIds(List<Long> newFlightIds) {
        this.newFlightIds = newFlightIds != null ? newFlightIds : new ArrayList<>();
    }

    public int getUpdatedFlightsCount() {
        return updatedFlightsCount;
    }

    public void setUpdatedFlightsCount(int updatedFlightsCount) {
        this.updatedFlightsCount = updatedFlightsCount;
    }

    public List<Long> getUpdatedFlightIds() {
        return updatedFlightIds;
    }

    public void setUpdatedFlightIds(List<Long> updatedFlightIds) {
        this.updatedFlightIds = updatedFlightIds != null ? updatedFlightIds : new ArrayList<>();
    }

    public int getUpdatedHotelsCount() {
        return updatedHotelsCount;
    }

    public void setUpdatedHotelsCount(int updatedHotelsCount) {
        this.updatedHotelsCount = updatedHotelsCount;
    }

    public List<Long> getUpdatedHotelIds() {
        return updatedHotelIds;
    }

    public void setUpdatedHotelIds(List<Long> updatedHotelIds) {
        this.updatedHotelIds = updatedHotelIds != null ? updatedHotelIds : new ArrayList<>();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

