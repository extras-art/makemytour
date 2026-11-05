package com.makemytrip.makemytrip.dynamicpricing.repository;

import com.makemytrip.makemytrip.dynamicpricing.model.EntityType;
import com.makemytrip.makemytrip.dynamicpricing.model.PriceHistoryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistoryEntry, Long> {

    List<PriceHistoryEntry> findByEntityTypeAndEntityIdOrderByRecordedAtAsc(EntityType entityType, Long entityId);

    @Query("SELECT MIN(p.recordedPrice) FROM PriceHistoryEntry p WHERE p.entityType = :entityType AND p.entityId = :entityId AND p.recordedAt >= :since")
    BigDecimal findLowestPriceSince(@Param("entityType") EntityType entityType,
                                    @Param("entityId") Long entityId,
                                    @Param("since") LocalDateTime since);

    @Query("SELECT MAX(p.recordedPrice) FROM PriceHistoryEntry p WHERE p.entityType = :entityType AND p.entityId = :entityId AND p.recordedAt >= :since")
    BigDecimal findHighestPriceSince(@Param("entityType") EntityType entityType,
                                     @Param("entityId") Long entityId,
                                     @Param("since") LocalDateTime since);
}

