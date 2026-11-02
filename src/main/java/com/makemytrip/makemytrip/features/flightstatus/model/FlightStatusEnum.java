package com.makemytrip.makemytrip.features.flightstatus.model;

public enum FlightStatusEnum {
    ON_TIME("On Time"),
    BOARDING("Boarding"),
    DELAYED("Delayed"),
    IN_AIR("In Air"),
    LANDED("Landed");

    private final String displayName;

    FlightStatusEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

