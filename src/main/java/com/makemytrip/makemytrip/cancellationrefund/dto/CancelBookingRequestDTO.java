package com.makemytrip.makemytrip.cancellationrefund.dto;

import com.makemytrip.makemytrip.cancellationrefund.model.CancellationReasonEnum;
import jakarta.validation.constraints.NotNull;

public class CancelBookingRequestDTO {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    private Integer quantityToCancel;

    @NotNull(message = "Cancellation reason is required")
    private CancellationReasonEnum reason;

    private String additionalNotes;

    public CancelBookingRequestDTO() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Integer getQuantityToCancel() { return quantityToCancel; }
    public void setQuantityToCancel(Integer quantityToCancel) { this.quantityToCancel = quantityToCancel; }

    public CancellationReasonEnum getReason() { return reason; }
    public void setReason(CancellationReasonEnum reason) { this.reason = reason; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }
}

