package com.makemytrip.makemytrip.dynamicpricing.service;

import com.makemytrip.makemytrip.dynamicpricing.dto.PriceBreakdownDTO;
import com.makemytrip.makemytrip.dynamicpricing.dto.PriceLockResponseDTO;
import com.makemytrip.makemytrip.dynamicpricing.model.EntityType;
import com.makemytrip.makemytrip.dynamicpricing.model.PriceLock;
import com.makemytrip.makemytrip.dynamicpricing.repository.PriceLockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PriceFreezeService {

    private final PriceLockRepository priceLockRepository;
    private final DynamicPricingEngineService dynamicPricingEngineService;

    public PriceFreezeService(PriceLockRepository priceLockRepository,
                              DynamicPricingEngineService dynamicPricingEngineService) {
        this.priceLockRepository = priceLockRepository;
        this.dynamicPricingEngineService = dynamicPricingEngineService;
    }

    @Transactional
    public PriceLockResponseDTO createLock(Long userId, EntityType type, Long entityId) {
        LocalDateTime now = LocalDateTime.now();

        // Check if an active, unexpired lock already exists for this user and item
        Optional<PriceLock> existingLock = priceLockRepository
                .findFirstByUserIdAndEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
                        userId, type, entityId, now);

        if (existingLock.isPresent()) {
            PriceLock lock = existingLock.get();
            long remaining = Duration.between(now, lock.getExpiresAt()).getSeconds();
            return new PriceLockResponseDTO(
                    lock.getLockId(),
                    lock.getEntityId(),
                    lock.getEntityType().name(),
                    lock.getLockedPrice().doubleValue(),
                    lock.getExpiresAt(),
                    Math.max(0, remaining)
            );
        }

        // Calculate current final dynamic price to freeze
        PriceBreakdownDTO breakdown = dynamicPricingEngineService.computeBreakdown(type, entityId);
        BigDecimal lockedPrice = BigDecimal.valueOf(breakdown.getFinalPrice()).setScale(2, RoundingMode.HALF_UP);
        LocalDateTime expiresAt = now.plusMinutes(30);
        String lockId = UUID.randomUUID().toString();

        PriceLock lock = new PriceLock(lockId, userId, type, entityId, lockedPrice, expiresAt);
        priceLockRepository.save(lock);

        return new PriceLockResponseDTO(
                lockId,
                entityId,
                type.name(),
                lockedPrice.doubleValue(),
                expiresAt,
                1800L
        );
    }

    @Transactional(readOnly = true)
    public Optional<PriceLockResponseDTO> getActiveLock(Long userId, EntityType type, Long entityId) {
        LocalDateTime now = LocalDateTime.now();
        return priceLockRepository
                .findFirstByUserIdAndEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
                        userId, type, entityId, now)
                .map(lock -> {
                    long remaining = Duration.between(now, lock.getExpiresAt()).getSeconds();
                    return new PriceLockResponseDTO(
                            lock.getLockId(),
                            lock.getEntityId(),
                            lock.getEntityType().name(),
                            lock.getLockedPrice().doubleValue(),
                            lock.getExpiresAt(),
                            Math.max(0, remaining)
                    );
                });
    }

    @Transactional
    public BigDecimal resolveEffectiveUnitPrice(Long userId, EntityType type, Long entityId, BigDecimal currentEntityPrice) {
        if (userId == null || entityId == null || type == null) {
            return currentEntityPrice != null ? currentEntityPrice : BigDecimal.ZERO;
        }

        LocalDateTime now = LocalDateTime.now();
        Optional<PriceLock> activeLock = priceLockRepository
                .findFirstByUserIdAndEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
                        userId, type, entityId, now);

        if (activeLock.isPresent()) {
            PriceLock lock = activeLock.get();
            lock.setUsed(true);
            priceLockRepository.save(lock);
            return lock.getLockedPrice();
        }

        return currentEntityPrice != null ? currentEntityPrice : BigDecimal.ZERO;
    }
}

