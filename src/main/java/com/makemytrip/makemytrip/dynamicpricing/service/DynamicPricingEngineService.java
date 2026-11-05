package com.makemytrip.makemytrip.dynamicpricing.service;

import com.makemytrip.makemytrip.dynamicpricing.dto.PriceBreakdownDTO;
import com.makemytrip.makemytrip.dynamicpricing.model.EntityType;
import com.makemytrip.makemytrip.dynamicpricing.model.PriceHistoryEntry;
import com.makemytrip.makemytrip.dynamicpricing.repository.PriceHistoryRepository;
import com.makemytrip.makemytrip.dynamicpricing.repository.PriceLockRepository;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.sqldailyupdate.event.InventoryRefreshedEvent;
import com.makemytrip.makemytrip.sqldailyupdate.service.BaselinePriceCache;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class DynamicPricingEngineService {

    private static final Logger log = LoggerFactory.getLogger(DynamicPricingEngineService.class);

    private final BaselinePriceCache baselinePriceCache;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceLockRepository priceLockRepository;
    private final SeasonalCalendarHelper seasonalCalendarHelper;

    public DynamicPricingEngineService(
            BaselinePriceCache baselinePriceCache,
            FlightRepository flightRepository,
            HotelRepository hotelRepository,
            BookingRepository bookingRepository,
            PriceHistoryRepository priceHistoryRepository,
            PriceLockRepository priceLockRepository,
            SeasonalCalendarHelper seasonalCalendarHelper) {
        this.baselinePriceCache = baselinePriceCache;
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.priceLockRepository = priceLockRepository;
        this.seasonalCalendarHelper = seasonalCalendarHelper;
    }

    public PriceBreakdownDTO computeBreakdown(EntityType type, Long entityId) {
        if (type == EntityType.FLIGHT) {
            Flight flight = flightRepository.findById(entityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Flight not found with id: " + entityId));
            return computeFlightBreakdown(flight);
        } else {
            Hotel hotel = hotelRepository.findById(entityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + entityId));
            return computeHotelBreakdown(hotel);
        }
    }

    private PriceBreakdownDTO computeFlightBreakdown(Flight flight) {
        BigDecimal base = baselinePriceCache.getFlightBaseline(flight.getId(), flight.getPrice());
        double basePriceVal = base.doubleValue();

        double scarcityPct = 0.0;
        int seats = flight.getAvailableSeats() != null ? flight.getAvailableSeats() : 0;
        List<String> badges = new ArrayList<>();

        if (seats < 15) {
            scarcityPct = 18.0;
            badges.add("High Scarcity: <15 seats (+18%)");
        } else if (seats < 40) {
            scarcityPct = 8.0;
            badges.add("Moderate Availability (<40 seats left)");
        } else if (seats > 120) {
            scarcityPct = -5.0;
            badges.add("High Availability Discount (-5%)");
        }

        double timeHorizonPct = 0.0;
        LocalDateTime departure = flight.getDepartureTime() != null ? flight.getDepartureTime() : LocalDateTime.now().plusDays(5);
        long daysUntilDeparture = Duration.between(LocalDateTime.now(), departure).toDays();

        if (daysUntilDeparture <= 3) {
            timeHorizonPct = 20.0;
            badges.add("Last-Minute Window (+20%)");
        } else if (daysUntilDeparture <= 7) {
            timeHorizonPct = 12.0;
            badges.add("Near Departure Window (+12%)");
        } else if (daysUntilDeparture > 30) {
            timeHorizonPct = -8.0;
            badges.add("Early Bird Saver (-8%)");
        }

        double seasonalPct = seasonalCalendarHelper.getSeasonalMultiplierPct(departure);
        if (seasonalPct > 0) {
            badges.add(seasonalCalendarHelper.getSeasonLabel(departure) + " (+" + (int) seasonalPct + "%)");
        }

        Integer reservedSeats = bookingRepository.countReservedSeatsByFlightId(flight.getId());
        long activeLocks = priceLockRepository.countActiveLocks(EntityType.FLIGHT, flight.getId(), LocalDateTime.now());
        double demandPct = calculateDemandMultiplier(reservedSeats != null ? reservedSeats : 0, activeLocks, badges);

        double totalMultiplierPct = scarcityPct + timeHorizonPct + seasonalPct + demandPct;
        double rawMultiplier = 1.0 + (totalMultiplierPct / 100.0);
        double clampedMultiplier = Math.max(0.85, Math.min(1.65, rawMultiplier));

        BigDecimal finalPrice = BaselinePriceCache.clampFlightPrice(
                BigDecimal.valueOf(basePriceVal * clampedMultiplier).setScale(2, RoundingMode.HALF_UP));

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        BigDecimal minPrice = priceHistoryRepository.findLowestPriceSince(EntityType.FLIGHT, flight.getId(), thirtyDaysAgo);
        BigDecimal maxPrice = priceHistoryRepository.findHighestPriceSince(EntityType.FLIGHT, flight.getId(), thirtyDaysAgo);

        double lowest30d = minPrice != null ? minPrice.doubleValue() : Math.min(basePriceVal, finalPrice.doubleValue());
        double highest30d = maxPrice != null ? maxPrice.doubleValue() : Math.max(basePriceVal, finalPrice.doubleValue());

        String summary = String.format("Anchored to baseline ₹%.0f with %+.1f%% net adjustments (Scarcity: %+.0f%%, Horizon: %+.0f%%, Season: %+.0f%%, Demand: %+.0f%%). Clamped range [0.85x - 1.65x].",
                basePriceVal, (clampedMultiplier - 1.0) * 100.0, scarcityPct, timeHorizonPct, seasonalPct, demandPct);

        return new PriceBreakdownDTO(
                flight.getId(),
                "FLIGHT",
                basePriceVal,
                finalPrice.doubleValue(),
                lowest30d,
                highest30d,
                demandPct,
                seasonalPct,
                scarcityPct,
                timeHorizonPct,
                badges,
                summary
        );
    }

    private PriceBreakdownDTO computeHotelBreakdown(Hotel hotel) {
        BigDecimal base = baselinePriceCache.getHotelBaseline(hotel.getId(), hotel.getPricePerNight());
        double basePriceVal = base.doubleValue();

        double scarcityPct = 0.0;
        int rooms = hotel.getAvailableRooms() != null ? hotel.getAvailableRooms() : 0;
        List<String> badges = new ArrayList<>();

        if (rooms < 5) {
            scarcityPct = 15.0;
            badges.add("Almost Sold Out: <5 rooms (+15%)");
        } else if (rooms < 12) {
            scarcityPct = 7.0;
            badges.add("High Occupancy: <12 rooms (+7%)");
        }

        double timeHorizonPct = 0.0;
        double seasonalPct = seasonalCalendarHelper.getSeasonalMultiplierPct(LocalDateTime.now());
        if (seasonalPct > 0) {
            badges.add(seasonalCalendarHelper.getSeasonLabel(LocalDateTime.now()) + " (+" + (int) seasonalPct + "%)");
        }

        Integer reservedRooms = bookingRepository.countReservedRoomsByHotelId(hotel.getId());
        long activeLocks = priceLockRepository.countActiveLocks(EntityType.HOTEL, hotel.getId(), LocalDateTime.now());
        double demandPct = calculateDemandMultiplier(reservedRooms != null ? reservedRooms : 0, activeLocks, badges);

        double totalMultiplierPct = scarcityPct + timeHorizonPct + seasonalPct + demandPct;
        double rawMultiplier = 1.0 + (totalMultiplierPct / 100.0);
        double clampedMultiplier = Math.max(0.85, Math.min(1.65, rawMultiplier));

        BigDecimal finalPrice = BaselinePriceCache.clampHotelPrice(
                BigDecimal.valueOf(basePriceVal * clampedMultiplier).setScale(2, RoundingMode.HALF_UP));

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        BigDecimal minPrice = priceHistoryRepository.findLowestPriceSince(EntityType.HOTEL, hotel.getId(), thirtyDaysAgo);
        BigDecimal maxPrice = priceHistoryRepository.findHighestPriceSince(EntityType.HOTEL, hotel.getId(), thirtyDaysAgo);

        double lowest30d = minPrice != null ? minPrice.doubleValue() : Math.min(basePriceVal, finalPrice.doubleValue());
        double highest30d = maxPrice != null ? maxPrice.doubleValue() : Math.max(basePriceVal, finalPrice.doubleValue());

        String summary = String.format("Anchored to baseline ₹%.0f with %+.1f%% net adjustments (Scarcity: %+.0f%%, Season: %+.0f%%, Demand: %+.0f%%). Clamped range [0.85x - 1.65x].",
                basePriceVal, (clampedMultiplier - 1.0) * 100.0, scarcityPct, seasonalPct, demandPct);

        return new PriceBreakdownDTO(
                hotel.getId(),
                "HOTEL",
                basePriceVal,
                finalPrice.doubleValue(),
                lowest30d,
                highest30d,
                demandPct,
                seasonalPct,
                scarcityPct,
                timeHorizonPct,
                badges,
                summary
        );
    }

    private double calculateDemandMultiplier(int reservedQuantity, long activeLocks, List<String> badges) {
        double demandPct = 0.0;
        if (reservedQuantity > 10) {
            demandPct = 12.0;
            badges.add("High Booking Demand (+12%)");
        } else if (reservedQuantity > 5) {
            demandPct = 8.0;
            badges.add("Moderate Demand (+8%)");
        } else if (reservedQuantity > 2) {
            demandPct = 5.0;
            badges.add("Steady Bookings (+5%)");
        }

        double velocityBoost = Math.min(6.0, activeLocks * 2.0);
        if (velocityBoost > 0) {
            demandPct += velocityBoost;
            badges.add("Real-Time View Velocity (+" + (int) velocityBoost + "%)");
        }
        return demandPct;
    }

    @Transactional
    public void applyDynamicPrice(EntityType type, Long entityId) {
        PriceBreakdownDTO breakdown = computeBreakdown(type, entityId);
        BigDecimal finalPrice = BigDecimal.valueOf(breakdown.getFinalPrice()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal basePrice = BigDecimal.valueOf(breakdown.getBasePrice()).setScale(2, RoundingMode.HALF_UP);

        String reason = breakdown.getActiveRuleBadges().isEmpty() ? "Standard Dynamic Rate" : String.join(", ", breakdown.getActiveRuleBadges());
        if (reason.length() > 255) {
            reason = reason.substring(0, 252) + "...";
        }

        if (type == EntityType.FLIGHT) {
            Flight flight = flightRepository.findById(entityId).orElse(null);
            if (flight != null) {
                flight.setPrice(finalPrice);
                flightRepository.save(flight);
            }
        } else {
            Hotel hotel = hotelRepository.findById(entityId).orElse(null);
            if (hotel != null) {
                hotel.setPricePerNight(finalPrice);
                hotelRepository.save(hotel);
            }
        }

        PriceHistoryEntry entry = new PriceHistoryEntry(type, entityId, finalPrice, basePrice, reason, LocalDateTime.now());
        priceHistoryRepository.save(entry);
    }

    @Transactional
    public void seedPriceHistory(EntityType type, Long entityId) {
        List<PriceHistoryEntry> existing = priceHistoryRepository.findByEntityTypeAndEntityIdOrderByRecordedAtAsc(type, entityId);
        if (existing.size() >= 14) {
            return;
        }

        BigDecimal base = (type == EntityType.FLIGHT)
                ? baselinePriceCache.getFlightBaseline(entityId, BigDecimal.valueOf(5000.0))
                : baselinePriceCache.getHotelBaseline(entityId, BigDecimal.valueOf(3500.0));

        double baseVal = base.doubleValue();
        Random rng = new Random(entityId * 31 + (type == EntityType.FLIGHT ? 1 : 2));

        String[] sampleReasons = {
                "Standard Base Rate",
                "Weekend Travel Surge",
                "High Occupancy Spike",
                "Early Bird Promotion",
                "Festive Demand Inflow",
                "Scarcity Adjustment",
                "Midweek Off-Peak Saver"
        };

        for (int i = 14; i >= 1; i--) {
            LocalDateTime timestamp = LocalDateTime.now().minusDays(i).plusHours(rng.nextInt(12) + 8);
            double multiplier = 0.88 + (rng.nextDouble() * 0.65); // 0.88 to 1.53
            double clamped = Math.max(0.85, Math.min(1.65, multiplier));
            BigDecimal recorded = BigDecimal.valueOf(baseVal * clamped).setScale(2, RoundingMode.HALF_UP);
            String reason = sampleReasons[rng.nextInt(sampleReasons.length)];

            PriceHistoryEntry entry = new PriceHistoryEntry(type, entityId, recorded, base, reason, timestamp);
            priceHistoryRepository.save(entry);
        }
    }

    @Transactional
    public PriceBreakdownDTO simulateSurge(EntityType type, Long entityId) {
        PriceBreakdownDTO breakdown = computeBreakdown(type, entityId);
        BigDecimal base = BigDecimal.valueOf(breakdown.getBasePrice());
        double surgedPriceVal = Math.min(breakdown.getBasePrice() * 1.65, breakdown.getFinalPrice() * 1.12);
        BigDecimal surgedPrice = BigDecimal.valueOf(surgedPriceVal).setScale(2, RoundingMode.HALF_UP);

        if (type == EntityType.FLIGHT) {
            Flight flight = flightRepository.findById(entityId).orElseThrow(() -> new ResourceNotFoundException("Flight not found"));
            flight.setPrice(surgedPrice);
            flightRepository.save(flight);
        } else {
            Hotel hotel = hotelRepository.findById(entityId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
            hotel.setPricePerNight(surgedPrice);
            hotelRepository.save(hotel);
        }

        PriceHistoryEntry entry = new PriceHistoryEntry(
                type,
                entityId,
                surgedPrice,
                base,
                "Simulated Demand Surge (+12%)",
                LocalDateTime.now()
        );
        priceHistoryRepository.save(entry);

        return computeBreakdown(type, entityId);
    }

    @PostConstruct
    public void initializePricing() {
        try {
            flightRepository.findByActiveTrue().forEach(flight -> {
                try {
                    seedPriceHistory(EntityType.FLIGHT, flight.getId());
                    applyDynamicPrice(EntityType.FLIGHT, flight.getId());
                } catch (Exception e) {
                    log.warn("Failed seeding flight pricing {}: {}", flight.getId(), e.getMessage());
                }
            });

            hotelRepository.findByActiveTrue().forEach(hotel -> {
                try {
                    seedPriceHistory(EntityType.HOTEL, hotel.getId());
                    applyDynamicPrice(EntityType.HOTEL, hotel.getId());
                } catch (Exception e) {
                    log.warn("Failed seeding hotel pricing {}: {}", hotel.getId(), e.getMessage());
                }
            });
            log.info("Initialized dynamic pricing & price history for flights and hotels.");
        } catch (Exception e) {
            log.warn("Deferred dynamic pricing initialization: {}", e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onInventoryRefreshed(InventoryRefreshedEvent event) {
        if (event == null) return;

        if (event.getNewFlightIds() != null) {
            for (Long id : event.getNewFlightIds()) {
                seedPriceHistory(EntityType.FLIGHT, id);
                applyDynamicPrice(EntityType.FLIGHT, id);
            }
        }

        if (event.getUpdatedFlightIds() != null) {
            for (Long id : event.getUpdatedFlightIds()) {
                applyDynamicPrice(EntityType.FLIGHT, id);
            }
        }
    }
}

