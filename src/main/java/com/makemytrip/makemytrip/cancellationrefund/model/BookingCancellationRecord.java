package com.makemytrip.makemytrip.cancellationrefund.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_cancellations", indexes = {
    @Index(name = "idx_cancellation_booking_id", columnList = "booking_id"),
    @Index(name = "idx_cancellation_user_id", columnList = "user_id")
})
public class BookingCancellationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "cancelled_quantity", nullable = false)
    private Integer cancelledQuantity;

    @Column(name = "original_booking_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalBookingAmount = BigDecimal.ZERO;

    @Column(name = "cancelled_portion_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal cancelledPortionAmount = BigDecimal.ZERO;

    @Column(name = "refund_percentage", nullable = false)
    private Integer refundPercentage = 0;

    @Column(name = "cancellation_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal cancellationFee = BigDecimal.ZERO;

    @Column(name = "refund_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "policy_applied_label", length = 150)
    private String policyAppliedLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 50)
    private CancellationReasonEnum reason = CancellationReasonEnum.OTHER;

    @Column(name = "additional_notes", length = 500)
    private String additionalNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status", nullable = false, length = 30)
    private RefundStatusEnum refundStatus = RefundStatusEnum.PENDING;

    @Column(name = "expected_completion_at")
    private LocalDateTime expectedCompletionAt;

    @Column(name = "cancelled_at", nullable = false)
    private LocalDateTime cancelledAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public BookingCancellationRecord() {}

    @PrePersist
    public void prePersist() {
        if (cancelledAt == null) {
            cancelledAt = LocalDateTime.now();
        }
        if (expectedCompletionAt == null && cancelledAt != null) {
            expectedCompletionAt = cancelledAt.plusDays(5);
        }
        if (refundStatus == null) {
            refundStatus = RefundStatusEnum.PENDING;
        }
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

