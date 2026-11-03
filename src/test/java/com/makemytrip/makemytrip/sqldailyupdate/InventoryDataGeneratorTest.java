package com.makemytrip.makemytrip.sqldailyupdate;

import com.makemytrip.makemytrip.sqldailyupdate.generator.InventoryDataGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class InventoryDataGeneratorTest {

    private InventoryDataGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new InventoryDataGenerator();
    }

    @Test
    void testFluctuateFlightPrice_WithinBounds() {
        BigDecimal baseline = BigDecimal.valueOf(5000.00);
        for (int i = 0; i < 50; i++) {
            BigDecimal fluctuated = generator.fluctuateFlightPrice(baseline);
            assertNotNull(fluctuated);
            assertTrue(fluctuated.compareTo(BigDecimal.valueOf(1500.00)) >= 0, "Price should not drop below min");
            // Baseline +/- 15% means within [4250, 5750]
            assertTrue(fluctuated.compareTo(BigDecimal.valueOf(4200.00)) >= 0, "Price within range");
            assertTrue(fluctuated.compareTo(BigDecimal.valueOf(5800.00)) <= 0, "Price within range");
        }
    }

    @Test
    void testFluctuateHotelPrice_WithinBounds() {
        BigDecimal baseline = BigDecimal.valueOf(4000.00);
        for (int i = 0; i < 50; i++) {
            BigDecimal fluctuated = generator.fluctuateHotelPrice(baseline);
            assertNotNull(fluctuated);
            assertTrue(fluctuated.compareTo(BigDecimal.valueOf(800.00)) >= 0, "Price should not drop below min");
            // Baseline +/- 10% means within [3600, 4400]
            assertTrue(fluctuated.compareTo(BigDecimal.valueOf(3550.00)) >= 0, "Hotel price within range");
            assertTrue(fluctuated.compareTo(BigDecimal.valueOf(4450.00)) <= 0, "Hotel price within range");
        }
    }

    @Test
    void testGenerateFutureDepartureTime() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime originalDeparture = LocalDateTime.of(2026, 11, 2, 10, 30);

        for (int i = 0; i < 30; i++) {
            LocalDateTime future = generator.generateFutureDepartureTime(originalDeparture, 7, 60);
            assertNotNull(future);
            assertTrue(future.isAfter(now.plusDays(6)), "Departure should be at least ~7 days ahead");
            assertTrue(future.isBefore(now.plusDays(62)), "Departure should be within horizon days");
        }
    }

    @Test
    void testCalculateArrivalTime_HandlesOvernightRollover() {
        // Flight departing at 23:30 with 2 hour duration -> 01:30 next day
        LocalDateTime departure = LocalDateTime.of(2026, 11, 10, 23, 30);
        Duration duration = Duration.ofHours(2).plusMinutes(15);

        LocalDateTime arrival = generator.calculateArrivalTime(departure, duration);
        assertNotNull(arrival);
        assertEquals(departure.plusDays(1).toLocalDate(), arrival.toLocalDate(), "Should roll over to next calendar day");
        assertEquals(1, arrival.getHour());
        assertEquals(45, arrival.getMinute());
        assertEquals(duration, Duration.between(departure, arrival), "Exact duration must be preserved");
    }

    @Test
    void testApplyMinorScheduleVariance() {
        LocalDateTime departure = LocalDateTime.of(2026, 11, 15, 14, 0);
        for (int i = 0; i < 30; i++) {
            LocalDateTime shifted = generator.applyMinorScheduleVariance(departure);
            assertNotNull(shifted);
            long diffMinutes = Math.abs(Duration.between(departure, shifted).toMinutes());
            assertTrue(diffMinutes >= 15 && diffMinutes <= 30, "Variance must be between 15 and 30 minutes");
        }
    }

    @Test
    void testGenerateSeatsAndRoomsBounds() {
        for (int i = 0; i < 50; i++) {
            int seats = generator.generateAvailableSeats();
            assertTrue(seats >= 45 && seats <= 180, "Available seats between 45 and 180");

            int rooms = generator.generateAvailableRooms();
            assertTrue(rooms >= 10 && rooms <= 50, "Available rooms between 10 and 50");
        }
    }
}

