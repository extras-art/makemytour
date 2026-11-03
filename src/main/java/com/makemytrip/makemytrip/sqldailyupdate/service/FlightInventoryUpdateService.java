package com.makemytrip.makemytrip.sqldailyupdate.service;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.sqldailyupdate.config.InventoryUpdateProperties;
import com.makemytrip.makemytrip.sqldailyupdate.generator.InventoryDataGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FlightInventoryUpdateService {

    private static final Logger log = LoggerFactory.getLogger(FlightInventoryUpdateService.class);

    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final BaselinePriceCache baselinePriceCache;
    private final InventoryDataGenerator dataGenerator;
    private final InventoryUpdateProperties properties;

    public FlightInventoryUpdateService(
        FlightRepository flightRepository,
        BookingRepository bookingRepository,
        BaselinePriceCache baselinePriceCache,
        InventoryDataGenerator dataGenerator,
        InventoryUpdateProperties properties
    ) {
        this.flightRepository = flightRepository;
        this.bookingRepository = bookingRepository;
        this.baselinePriceCache = baselinePriceCache;
        this.dataGenerator = dataGenerator;
        this.properties = properties;
    }

    public static class FlightRefreshResult {
        private final List<Long> deactivatedFlightIds;
        private final List<Long> newFlightIds;
        private final List<Long> updatedFlightIds;

        public FlightRefreshResult(List<Long> deactivatedFlightIds, List<Long> newFlightIds, List<Long> updatedFlightIds) {
            this.deactivatedFlightIds = deactivatedFlightIds != null ? deactivatedFlightIds : Collections.emptyList();
            this.newFlightIds = newFlightIds != null ? newFlightIds : Collections.emptyList();
            this.updatedFlightIds = updatedFlightIds != null ? updatedFlightIds : Collections.emptyList();
        }

        public List<Long> getDeactivatedFlightIds() {
            return deactivatedFlightIds;
        }

        public List<Long> getNewFlightIds() {
            return newFlightIds;
        }

        public List<Long> getUpdatedFlightIds() {
            return updatedFlightIds;
        }
    }

    @Transactional
    public FlightRefreshResult refreshFlightInventory() {
        LocalDateTime now = LocalDateTime.now();
        List<Long> deactivatedFlightIds = new ArrayList<>();
        List<Long> newFlightIds = new ArrayList<>();
        List<Long> updatedFlightIds = new ArrayList<>();

        int minDaysAhead = properties.getFlight() != null ? properties.getFlight().getMinDaysAhead() : 7;
        int horizonDays = properties.getFlight() != null ? properties.getFlight().getHorizonDays() : 60;

        // 1. Expired Flight Soft-Deactivation
        List<Flight> expiredActiveFlights = flightRepository.findActiveFlightsDepartedBefore(now);
        log.info("Found {} expired active flights to soft-deactivate.", expiredActiveFlights.size());

        for (Flight expired : expiredActiveFlights) {
            expired.setActive(false);
            flightRepository.save(expired);
            deactivatedFlightIds.add(expired.getId());

            // 2. 1-to-1 Replacement Flight Generation
            Duration routeDuration = Duration.ofHours(2).plusMinutes(15);
            if (expired.getDepartureTime() != null && expired.getArrivalTime() != null) {
                Duration calcDuration = Duration.between(expired.getDepartureTime(), expired.getArrivalTime());
                if (!calcDuration.isNegative() && !calcDuration.isZero()) {
                    routeDuration = calcDuration;
                }
            }

            LocalDateTime futureDeparture = dataGenerator.generateFutureDepartureTime(
                    expired.getDepartureTime(), minDaysAhead, horizonDays
            );
            LocalDateTime futureArrival = dataGenerator.calculateArrivalTime(futureDeparture, routeDuration);

            BigDecimal baselinePrice = baselinePriceCache.getFlightBaseline(expired.getId(), expired.getPrice());
            BigDecimal newPrice = dataGenerator.fluctuateFlightPrice(baselinePrice);
            int availableSeats = dataGenerator.generateAvailableSeats();

            Flight replacement = new Flight();
            replacement.setAirline(expired.getAirline());
            replacement.setSource(expired.getSource());
            replacement.setDestination(expired.getDestination());
            replacement.setDepartureTime(futureDeparture);
            replacement.setArrivalTime(futureArrival);
            replacement.setPrice(newPrice);
            replacement.setAvailableSeats(availableSeats);
            replacement.setActive(true);

            Flight savedReplacement = flightRepository.save(replacement);
            baselinePriceCache.putFlightBaseline(savedReplacement.getId(), baselinePrice);
            newFlightIds.add(savedReplacement.getId());
        }

        // 3. Active Future Flight Updates (Booking-Safe)
        List<Flight> activeFutureFlights = flightRepository.findActiveFlightsDepartingAfter(now);
        Set<Long> bookedFlightIds = new HashSet<>(bookingRepository.findDistinctBookedFlightIds());
        log.info("Processing {} active future flights ({} booked).", activeFutureFlights.size(), bookedFlightIds.size());

        for (Flight futureFlight : activeFutureFlights) {
            Long flightId = futureFlight.getId();
            BigDecimal baseline = baselinePriceCache.getFlightBaseline(flightId, futureFlight.getPrice());
            BigDecimal fluctuatedPrice = dataGenerator.fluctuateFlightPrice(baseline);
            futureFlight.setPrice(fluctuatedPrice);

            if (bookedFlightIds.contains(flightId)) {
                // If a future flight has existing bookings:
                // Do NOT shift its departure_time or arrival_time, and never reduce available_seats below reserved seats.
                Integer reservedSeats = bookingRepository.countReservedSeatsByFlightId(flightId);
                int safeReserved = reservedSeats != null ? reservedSeats : 0;
                if (futureFlight.getAvailableSeats() == null || futureFlight.getAvailableSeats() < safeReserved) {
                    futureFlight.setAvailableSeats(safeReserved);
                }
            } else {
                // If a future flight has NO bookings:
                // Optionally apply a minor schedule variance (±15–30 mins) while keeping exact duration positive.
                if (futureFlight.getDepartureTime() != null && futureFlight.getArrivalTime() != null) {
                    Duration duration = Duration.between(futureFlight.getDepartureTime(), futureFlight.getArrivalTime());
                    if (!duration.isNegative() && !duration.isZero()) {
                        LocalDateTime shiftedDep = dataGenerator.applyMinorScheduleVariance(futureFlight.getDepartureTime());
                        futureFlight.setDepartureTime(shiftedDep);
                        futureFlight.setArrivalTime(shiftedDep.plus(duration));
                    }
                }
                futureFlight.setAvailableSeats(dataGenerator.generateAvailableSeats());
            }

            flightRepository.save(futureFlight);
            updatedFlightIds.add(flightId);
        }

        return new FlightRefreshResult(deactivatedFlightIds, newFlightIds, updatedFlightIds);
    }
}

