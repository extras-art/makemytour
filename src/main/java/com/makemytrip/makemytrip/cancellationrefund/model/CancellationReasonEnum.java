package com.makemytrip.makemytrip.cancellationrefund.model;

public enum CancellationReasonEnum {
    CHANGE_OF_PLANS("Change of travel plans"),
    FOUND_BETTER_PRICE("Found a better price / alternative"),
    FLIGHT_DELAY_OR_RESCHEDULE("Flight delay or schedule change"),
    MEDICAL_EMERGENCY("Medical or family emergency"),
    BOOKED_BY_MISTAKE("Booked by mistake / wrong dates"),
    VISA_OR_DOCUMENT_ISSUE("Visa or travel documentation issue"),
    OTHER("Other personal reason");

    private final String displayName;

    CancellationReasonEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

