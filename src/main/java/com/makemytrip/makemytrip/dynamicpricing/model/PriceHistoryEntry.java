package com.makemytrip.makemytrip.dynamicpricing.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history_log", indexes = {
    @Index(name = "idx_history_entity_time", columnList = "entityType, entityId, recordedAt")
})
public class PriceHistoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EntityType entityType;

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal recordedPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false, length = 255)
    private String primaryReason;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    public PriceHistoryEntry() {}

    public PriceHistoryEntry(EntityType entityType, Long entityId, BigDecimal recordedPrice, BigDecimal basePrice, String primaryReason, LocalDateTime recordedAt) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.recordedPrice = recordedPrice;
        this.basePrice = basePrice;
        this.primaryReason = primaryReason;
        this.recordedAt = recordedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public BigDecimal getRecordedPrice() {
        return recordedPrice;
    }

    public void setRecordedPrice(BigDecimal recordedPrice) {
        this.recordedPrice = recordedPrice;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public String getPrimaryReason() {
        return primaryReason;
    }

    public void setPrimaryReason(String primaryReason) {
        this.primaryReason = primaryReason;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}

