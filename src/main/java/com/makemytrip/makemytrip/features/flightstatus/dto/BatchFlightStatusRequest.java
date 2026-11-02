package com.makemytrip.makemytrip.features.flightstatus.dto;

import java.util.ArrayList;
import java.util.List;

public class BatchFlightStatusRequest {

    private List<Long> flightIds = new ArrayList<>();

    public BatchFlightStatusRequest() {}

    public BatchFlightStatusRequest(List<Long> flightIds) {
        this.flightIds = flightIds;
    }

    public List<Long> getFlightIds() {
        return flightIds;
    }

    public void setFlightIds(List<Long> flightIds) {
        this.flightIds = flightIds;
    }
}

