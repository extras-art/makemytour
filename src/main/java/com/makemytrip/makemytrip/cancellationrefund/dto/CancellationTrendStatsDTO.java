package com.makemytrip.makemytrip.cancellationrefund.dto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class CancellationTrendStatsDTO {

    private Map<String, Long> reasonCounts = new HashMap<>();
    private long totalCancellations;
    private BigDecimal totalRefundedAmount = BigDecimal.ZERO;
    private long pendingRefundsCount;
    private long completedRefundsCount;

    public CancellationTrendStatsDTO() {}

    public Map<String, Long> getReasonCounts() { return reasonCounts; }
    public void setReasonCounts(Map<String, Long> reasonCounts) { this.reasonCounts = reasonCounts; }

    public long getTotalCancellations() { return totalCancellations; }
    public void setTotalCancellations(long totalCancellations) { this.totalCancellations = totalCancellations; }

    public BigDecimal getTotalRefundedAmount() { return totalRefundedAmount; }
    public void setTotalRefundedAmount(BigDecimal totalRefundedAmount) { this.totalRefundedAmount = totalRefundedAmount; }

    public long getPendingRefundsCount() { return pendingRefundsCount; }
    public void setPendingRefundsCount(long pendingRefundsCount) { this.pendingRefundsCount = pendingRefundsCount; }

    public long getCompletedRefundsCount() { return completedRefundsCount; }
    public void setCompletedRefundsCount(long completedRefundsCount) { this.completedRefundsCount = completedRefundsCount; }
}

