package com.makemytrip.makemytrip.cancellationrefund.dto;

import com.makemytrip.makemytrip.cancellationrefund.model.RefundStatusEnum;
import jakarta.validation.constraints.NotNull;

public class RefundStatusUpdateRequestDTO {

    @NotNull(message = "New refund status is required")
    private RefundStatusEnum newStatus;

    public RefundStatusUpdateRequestDTO() {}

    public RefundStatusUpdateRequestDTO(RefundStatusEnum newStatus) {
        this.newStatus = newStatus;
    }

    public RefundStatusEnum getNewStatus() { return newStatus; }
    public void setNewStatus(RefundStatusEnum newStatus) { this.newStatus = newStatus; }
}

