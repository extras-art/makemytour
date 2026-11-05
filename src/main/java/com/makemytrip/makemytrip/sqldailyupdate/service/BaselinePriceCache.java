package com.makemytrip.makemytrip.sqldailyupdate.service;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BaselinePriceCache {

    private static final Logger log = LoggerFactory.getLogger(BaselinePriceCache.class);

    public static final BigDecimal MIN_FLIGHT_PRICE = BigDecimal.valueOf(2500.00);
    public static final BigDecimal MAX_FLIGHT_PRICE = BigDecimal.valueOf(45000.00);
    public static final BigDecimal MIN_HOTEL_PRICE = BigDecimal.valueOf(1500.00);
    public static final BigDecimal MAX_HOTEL_PRICE = BigDecimal.valueOf(35000.00);
    public static final BigDecimal RUNAWAY_THRESHOLD = BigDecimal.valueOf(100000.00);

    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;

    private final ConcurrentHashMap<Long, BigDecimal> flightBaselinePrices = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, BigDecimal> hotelBaselinePrices = new ConcurrentHashMap<>();

    public BaselinePriceCache(FlightRepository flightRepository, HotelRepository hotelRepository) {
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
    }

    public static BigDecimal clampFlightPrice(BigDecimal price) {
        if (price == null) {
            return BigDecimal.valueOf(5000.00);
        }
        if (price.compareTo(MIN_FLIGHT_PRICE) < 0) {
            return MIN_FLIGHT_PRICE;
        }
        if (price.compareTo(MAX_FLIGHT_PRICE) > 0) {
            return MAX_FLIGHT_PRICE;
        }
        return price;
    }

    public static BigDecimal clampHotelPrice(BigDecimal price) {
        if (price == null) {
            return BigDecimal.valueOf(3500.00);
        }
        if (price.compareTo(MIN_HOTEL_PRICE) < 0) {
            return MIN_HOTEL_PRICE;
        }
        if (price.compareTo(MAX_HOTEL_PRICE) > 0) {
            return MAX_HOTEL_PRICE;
        }
        return price;
    }

    public static BigDecimal generateRealisticFlightPrice(Flight flight) {
        long seed = (flight != null && flight.getId() != null) ? flight.getId() * 2657L : 4500L;
        int price = 3500 + (int) (Math.abs(seed) % 14500); // 3,500 to 18,000
        return BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal generateRealisticHotelPrice(Hotel hotel) {
        long seed = (hotel != null && hotel.getId() != null) ? hotel.getId() * 3137L : 3500L;
        int price = 2500 + (int) (Math.abs(seed) % 12500); // 2,500 to 15,000
        return BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP);
    }

    @PostConstruct
    public void initBaselineCache() {
        try {
            flightRepository.findAll().forEach(flight -> {
                if (flight.getId() != null && flight.getPrice() != null) {
                    BigDecimal price = flight.getPrice();
                    // Reset runaway prices exceeding 100,000 or outside clamp bounds back to realistic prices
                    if (price.compareTo(RUNAWAY_THRESHOLD) > 0 || price.compareTo(MIN_FLIGHT_PRICE) < 0 || price.compareTo(MAX_FLIGHT_PRICE) > 0) {
                        BigDecimal resetPrice = generateRealisticFlightPrice(flight);
                        flight.setPrice(resetPrice);
                        flightRepository.save(flight);
                        price = resetPrice;
                        log.info("Reset runaway flight #{} price to ₹{}", flight.getId(), resetPrice);
                    }
                    flightBaselinePrices.put(flight.getId(), clampFlightPrice(price));
                }
            });
            hotelRepository.findAll().forEach(hotel -> {
                if (hotel.getId() != null && hotel.getPricePerNight() != null) {
                    BigDecimal price = hotel.getPricePerNight();
                    // Reset runaway prices exceeding 100,000 or outside clamp bounds back to realistic prices
                    if (price.compareTo(RUNAWAY_THRESHOLD) > 0 || price.compareTo(MIN_HOTEL_PRICE) < 0 || price.compareTo(MAX_HOTEL_PRICE) > 0) {
                        BigDecimal resetPrice = generateRealisticHotelPrice(hotel);
                        hotel.setPricePerNight(resetPrice);
                        hotelRepository.save(hotel);
                        price = resetPrice;
                        log.info("Reset runaway hotel #{} price to ₹{}", hotel.getId(), resetPrice);
                    }
                    hotelBaselinePrices.put(hotel.getId(), clampHotelPrice(price));
                }
            });
            log.info("Initialized BaselinePriceCache with {} flights and {} hotels.",
                    flightBaselinePrices.size(), hotelBaselinePrices.size());
        } catch (Exception e) {
            log.warn("BaselinePriceCache startup initialization postponed or failed: {}", e.getMessage());
        }
    }

    public BigDecimal getFlightBaseline(Long flightId, BigDecimal fallbackPrice) {
        BigDecimal fallbackClamped = clampFlightPrice(fallbackPrice);
        if (flightId == null) {
            return fallbackClamped;
        }
        return flightBaselinePrices.compute(flightId, (id, existing) -> {
            if (existing != null) {
                return clampFlightPrice(existing);
            }
            return fallbackClamped;
        });
    }

    public void putFlightBaseline(Long flightId, BigDecimal baselinePrice) {
        if (flightId != null && baselinePrice != null) {
            flightBaselinePrices.put(flightId, clampFlightPrice(baselinePrice));
        }
    }

    public BigDecimal getHotelBaseline(Long hotelId, BigDecimal fallbackPrice) {
        BigDecimal fallbackClamped = clampHotelPrice(fallbackPrice);
        if (hotelId == null) {
            return fallbackClamped;
        }
        return hotelBaselinePrices.compute(hotelId, (id, existing) -> {
            if (existing != null) {
                return clampHotelPrice(existing);
            }
            return fallbackClamped;
        });
    }

    public void putHotelBaseline(Long hotelId, BigDecimal baselinePrice) {
        if (hotelId != null && baselinePrice != null) {
            hotelBaselinePrices.put(hotelId, clampHotelPrice(baselinePrice));
        }
    }

    public int getCachedFlightCount() {
        return flightBaselinePrices.size();
    }

    public int getCachedHotelCount() {
        return hotelBaselinePrices.size();
    }
}
