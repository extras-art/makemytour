package com.makemytrip.makemytrip.cancellationrefund.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RefundQuoteDTO {

    private Long bookingId;
    private Integer quantityToCancel;
    private Integer totalQuantity;
    private BigDecimal originalTotalAmount;
    private BigDecimal cancelledPortionAmount;
    private Integer refundPercentage;
    private BigDecimal cancellationFee;
    private BigDecimal netRefundAmount;
    private String policyAppliedLabel;
    private String expectedTimelineText;
    private LocalDateTime travelDateTime;
    private Long hoursUntilTravel;
    private boolean operationalDelayWaiver;

    public RefundQuoteDTO() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Integer getQuantityToCancel() { return quantityToCancel; }
    public void setQuantityToCancel(Integer quantityToCancel) { this.quantityToCancel = quantityToCancel; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public BigDecimal getOriginalTotalAmount() { return originalTotalAmount; }
    public void setOriginalTotalAmount(BigDecimal originalTotalAmount) { this.originalTotalAmount = originalTotalAmount; }

    public BigDecimal getCancelledPortionAmount() { return cancelledPortionAmount; }
    public void setCancelledPortionAmount(BigDecimal cancelledPortionAmount) { this.cancelledPortionAmount = cancelledPortionAmount; }

    public Integer getRefundPercentage() { return refundPercentage; }
    public void setRefundPercentage(Integer refundPercentage) { this.refundPercentage = refundPercentage; }

    public BigDecimal getCancellationFee() { return cancellationFee; }
    public void setCancellationFee(BigDecimal cancellationFee) { this.cancellationFee = cancellationFee; }

    public BigDecimal getNetRefundAmount() { return netRefundAmount; }
    public void setNetRefundAmount(BigDecimal netRefundAmount) { this.netRefundAmount = netRefundAmount; }

    public String getPolicyAppliedLabel() { return policyAppliedLabel; }
    public void setPolicyAppliedLabel(String policyAppliedLabel) { this.policyAppliedLabel = policyAppliedLabel; }

    public String getExpectedTimelineText() { return expectedTimelineText; }
    public void setExpectedTimelineText(String expectedTimelineText) { this.expectedTimelineText = expectedTimelineText; }

    public LocalDateTime getTravelDateTime() { return travelDateTime; }
    public void setTravelDateTime(LocalDateTime travelDateTime) { this.travelDateTime = travelDateTime; }

    public Long getHoursUntilTravel() { return hoursUntilTravel; }
    public void setHoursUntilTravel(Long hoursUntilTravel) { this.hoursUntilTravel = hoursUntilTravel; }

    public boolean isOperationalDelayWaiver() { return operationalDelayWaiver; }
    public void setOperationalDelayWaiver(boolean operationalDelayWaiver) { this.operationalDelayWaiver = operationalDelayWaiver; }
}

