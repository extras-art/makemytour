package com.makemytrip.makemytrip.sqldailyupdate.event;

import org.springframework.context.ApplicationEvent;

import java.util.Collections;
import java.util.List;

public class InventoryRefreshedEvent extends ApplicationEvent {

    private final List<Long> deactivatedFlightIds;
    private final List<Long> newFlightIds;
    private final List<Long> updatedFlightIds;

    public InventoryRefreshedEvent(
        Object source,
        List<Long> deactivatedFlightIds,
        List<Long> newFlightIds,
        List<Long> updatedFlightIds
    ) {
        super(source);
        this.deactivatedFlightIds = deactivatedFlightIds != null ? List.copyOf(deactivatedFlightIds) : Collections.emptyList();
        this.newFlightIds = newFlightIds != null ? List.copyOf(newFlightIds) : Collections.emptyList();
        this.updatedFlightIds = updatedFlightIds != null ? List.copyOf(updatedFlightIds) : Collections.emptyList();
    }

    public List<Long> getDeactivatedFlightIds() {
        return deactivatedFlightIds;
    }

    public List<Long> getNewFlightIds() {
        return newFlightIds;
    }

    public List<Long> getUpdatedFlightIds() {
        return updatedFlightIds;
    }
}

