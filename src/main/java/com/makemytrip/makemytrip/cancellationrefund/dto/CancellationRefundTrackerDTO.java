package com.makemytrip.makemytrip.cancellationrefund.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.makemytrip.makemytrip.cancellationrefund.model.BookingCancellationRecord;
import com.makemytrip.makemytrip.cancellationrefund.model.CancellationReasonEnum;
import com.makemytrip.makemytrip.cancellationrefund.model.RefundStatusEnum;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CancellationRefundTrackerDTO {

    private Long id;
    private Long bookingId;
    private Long userId;
    private Integer cancelledQuantity;
    private BigDecimal originalBookingAmount;
    private BigDecimal cancelledPortionAmount;
    private Integer refundPercentage;
    private BigDecimal cancellationFee;
    private BigDecimal refundAmount;
    private String policyAppliedLabel;
    private CancellationReasonEnum reason;
    private String reasonLabel;
    private String additionalNotes;
    private RefundStatusEnum refundStatus;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expectedCompletionAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime cancelledAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime processedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedAt;

    public CancellationRefundTrackerDTO() {}

    public static CancellationRefundTrackerDTO from(BookingCancellationRecord record) {
        if (record == null) return null;
        CancellationRefundTrackerDTO dto = new CancellationRefundTrackerDTO();
        dto.setId(record.getId());
        dto.setBookingId(record.getBookingId());
        dto.setUserId(record.getUserId());
        dto.setCancelledQuantity(record.getCancelledQuantity());
        dto.setOriginalBookingAmount(record.getOriginalBookingAmount());
        dto.setCancelledPortionAmount(record.getCancelledPortionAmount());
        dto.setRefundPercentage(record.getRefundPercentage());
        dto.setCancellationFee(record.getCancellationFee());
        dto.setRefundAmount(record.getRefundAmount());
        dto.setPolicyAppliedLabel(record.getPolicyAppliedLabel());
        dto.setReason(record.getReason());
        dto.setReasonLabel(record.getReason() != null ? record.getReason().getDisplayName() : "N/A");
        dto.setAdditionalNotes(record.getAdditionalNotes());
        dto.setRefundStatus(record.getRefundStatus());
        dto.setExpectedCompletionAt(record.getExpectedCompletionAt());
        dto.setCancelledAt(record.getCancelledAt());
        dto.setProcessedAt(record.getProcessedAt());
        dto.setCompletedAt(record.getCompletedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getCancelledQuantity() { return cancelledQuantity; }
    public void setCancelledQuantity(Integer cancelledQuantity) { this.cancelledQuantity = cancelledQuantity; }

    public BigDecimal getOriginalBookingAmount() { return originalBookingAmount; }
    public void setOriginalBookingAmount(BigDecimal originalBookingAmount) { this.originalBookingAmount = originalBookingAmount; }

    public BigDecimal getCancelledPortionAmount() { return cancelledPortionAmount; }
    public void setCancelledPortionAmount(BigDecimal cancelledPortionAmount) { this.cancelledPortionAmount = cancelledPortionAmount; }

    public Integer getRefundPercentage() { return refundPercentage; }
    public void setRefundPercentage(Integer refundPercentage) { this.refundPercentage = refundPercentage; }

    public BigDecimal getCancellationFee() { return cancellationFee; }
    public void setCancellationFee(BigDecimal cancellationFee) { this.cancellationFee = cancellationFee; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getPolicyAppliedLabel() { return policyAppliedLabel; }
    public void setPolicyAppliedLabel(String policyAppliedLabel) { this.policyAppliedLabel = policyAppliedLabel; }

    public CancellationReasonEnum getReason() { return reason; }
    public void setReason(CancellationReasonEnum reason) { this.reason = reason; }

    public String getReasonLabel() { return reasonLabel; }
    public void setReasonLabel(String reasonLabel) { this.reasonLabel = reasonLabel; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public RefundStatusEnum getRefundStatus() { return refundStatus; }
    public void setRefundStatus(RefundStatusEnum refundStatus) { this.refundStatus = refundStatus; }

    public LocalDateTime getExpectedCompletionAt() { return expectedCompletionAt; }
    public void setExpectedCompletionAt(LocalDateTime expectedCompletionAt) { this.expectedCompletionAt = expectedCompletionAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}

