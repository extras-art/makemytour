package com.makemytrip.makemytrip.dynamicpricing.repository;

import com.makemytrip.makemytrip.dynamicpricing.model.EntityType;
import com.makemytrip.makemytrip.dynamicpricing.model.PriceLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PriceLockRepository extends JpaRepository<PriceLock, String> {

    Optional<PriceLock> findFirstByUserIdAndEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
            Long userId, EntityType entityType, Long entityId, LocalDateTime now);

    List<PriceLock> findByEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfter(
            EntityType entityType, Long entityId, LocalDateTime now);

    @Query("SELECT COUNT(l) FROM PriceLock l WHERE l.entityType = :entityType AND l.entityId = :entityId AND l.used = false AND l.expiresAt > :now")
    long countActiveLocks(@Param("entityType") EntityType entityType,
                         @Param("entityId") Long entityId,
                         @Param("now") LocalDateTime now);
}

