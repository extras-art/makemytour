package com.makemytrip.makemytrip.dynamicpricing.dto;

import java.time.LocalDateTime;

public class PriceLockResponseDTO {

    private String lockId;
    private Long entityId;
    private String entityType;
    private double lockedPrice;
    private LocalDateTime expiresAt;
    private long remainingSeconds;

    public PriceLockResponseDTO() {}

    public PriceLockResponseDTO(String lockId, Long entityId, String entityType, double lockedPrice, LocalDateTime expiresAt, long remainingSeconds) {
        this.lockId = lockId;
        this.entityId = entityId;
        this.entityType = entityType;
        this.lockedPrice = lockedPrice;
        this.expiresAt = expiresAt;
        this.remainingSeconds = remainingSeconds;
    }

    public String getLockId() {
        return lockId;
    }

    public void setLockId(String lockId) {
        this.lockId = lockId;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public double getLockedPrice() {
        return lockedPrice;
    }

    public void setLockedPrice(double lockedPrice) {
        this.lockedPrice = lockedPrice;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }
}

