package com.makemytrip.makemytrip.sqldailyupdate.generator;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class InventoryDataGenerator {

    private static final BigDecimal MIN_FLIGHT_PRICE = BigDecimal.valueOf(1500.00);
    private static final BigDecimal MIN_HOTEL_PRICE = BigDecimal.valueOf(800.00);

    /**
     * Fluctuates flight price by ±5% to 15% anchored to baseline price.
     * Guaranteed never to drop below MIN_FLIGHT_PRICE.
     */
    public BigDecimal fluctuateFlightPrice(BigDecimal baselinePrice) {
        if (baselinePrice == null || baselinePrice.compareTo(BigDecimal.ZERO) <= 0) {
            baselinePrice = BigDecimal.valueOf(4500.00);
        }

        boolean increase = ThreadLocalRandom.current().nextBoolean();
        double percent = ThreadLocalRandom.current().nextDouble(0.05, 0.15);
        double multiplier = increase ? (1.0 + percent) : (1.0 - percent);

        BigDecimal calculated = baselinePrice.multiply(BigDecimal.valueOf(multiplier))
                .setScale(2, RoundingMode.HALF_UP);

        return calculated.compareTo(MIN_FLIGHT_PRICE) < 0 ? MIN_FLIGHT_PRICE : calculated;
    }

    /**
     * Fluctuates hotel price by ±5% to 10% anchored to baseline price.
     * Guaranteed never to drop below MIN_HOTEL_PRICE.
     */
    public BigDecimal fluctuateHotelPrice(BigDecimal baselinePrice) {
        if (baselinePrice == null || baselinePrice.compareTo(BigDecimal.ZERO) <= 0) {
            baselinePrice = BigDecimal.valueOf(3000.00);
        }

        boolean increase = ThreadLocalRandom.current().nextBoolean();
        double percent = ThreadLocalRandom.current().nextDouble(0.05, 0.10);
        double multiplier = increase ? (1.0 + percent) : (1.0 - percent);

        BigDecimal calculated = baselinePrice.multiply(BigDecimal.valueOf(multiplier))
                .setScale(2, RoundingMode.HALF_UP);

        return calculated.compareTo(MIN_HOTEL_PRICE) < 0 ? MIN_HOTEL_PRICE : calculated;
    }

    /**
     * Generates a future departure time between minDaysAhead and horizonDays,
     * maintaining the flight's original time of day plus a slight realistic shift (±30 to 90 mins).
     */
    public LocalDateTime generateFutureDepartureTime(LocalDateTime originalDeparture, int minDaysAhead, int horizonDays) {
        int min = Math.max(1, minDaysAhead);
        int max = Math.max(min + 1, horizonDays);
        int daysAhead = ThreadLocalRandom.current().nextInt(min, max + 1);

        LocalDateTime targetDate = LocalDateTime.now().plusDays(daysAhead);

        int hour = originalDeparture != null ? originalDeparture.getHour() : ThreadLocalRandom.current().nextInt(6, 22);
        int minute = originalDeparture != null ? originalDeparture.getMinute() : ThreadLocalRandom.current().nextInt(0, 60);

        LocalDateTime futureScheduled = targetDate.withHour(hour).withMinute(minute).withSecond(0).withNano(0);

        boolean addShift = ThreadLocalRandom.current().nextBoolean();
        int shiftMinutes = ThreadLocalRandom.current().nextInt(30, 91);

        return addShift ? futureScheduled.plusMinutes(shiftMinutes) : futureScheduled.minusMinutes(shiftMinutes);
    }

    /**
     * Accurately calculates arrival time = departure time + duration, handling overnight rollovers.
     */
    public LocalDateTime calculateArrivalTime(LocalDateTime departureTime, Duration routeDuration) {
        if (departureTime == null) {
            departureTime = LocalDateTime.now().plusDays(7);
        }
        if (routeDuration == null || routeDuration.isNegative() || routeDuration.isZero()) {
            routeDuration = Duration.ofHours(2).plusMinutes(15);
        }
        return departureTime.plus(routeDuration);
    }

    /**
     * Applies a minor schedule variance (±15 to 30 mins) to an unbooked flight.
     */
    public LocalDateTime applyMinorScheduleVariance(LocalDateTime departureTime) {
        if (departureTime == null) {
            return LocalDateTime.now().plusDays(7);
        }
        boolean add = ThreadLocalRandom.current().nextBoolean();
        int variance = ThreadLocalRandom.current().nextInt(15, 31);
        return add ? departureTime.plusMinutes(variance) : departureTime.minusMinutes(variance);
    }

    /**
     * Generates available flight seats between 45 and 180.
     */
    public int generateAvailableSeats() {
        return ThreadLocalRandom.current().nextInt(45, 181);
    }

    /**
     * Generates available hotel rooms between 10 and 50.
     */
    public int generateAvailableRooms() {
        return ThreadLocalRandom.current().nextInt(10, 51);
    }
}

