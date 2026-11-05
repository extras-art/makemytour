package com.makemytrip.makemytrip.dynamicpricing.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_locks", indexes = {
    @Index(name = "idx_user_entity_lock", columnList = "userId, entityType, entityId")
})
public class PriceLock {

    @Id
    @Column(length = 64)
    private String lockId;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EntityType entityType;

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal lockedPrice;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    public PriceLock() {}

    public PriceLock(String lockId, Long userId, EntityType entityType, Long entityId, BigDecimal lockedPrice, LocalDateTime expiresAt) {
        this.lockId = lockId;
        this.userId = userId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.lockedPrice = lockedPrice;
        this.expiresAt = expiresAt;
        this.used = false;
    }

    public String getLockId() {
        return lockId;
    }

    public void setLockId(String lockId) {
        this.lockId = lockId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public BigDecimal getLockedPrice() {
        return lockedPrice;
    }

    public void setLockedPrice(BigDecimal lockedPrice) {
        this.lockedPrice = lockedPrice;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
}

