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
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BaselinePriceCache {

    private static final Logger log = LoggerFactory.getLogger(BaselinePriceCache.class);

    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;

    private final ConcurrentHashMap<Long, BigDecimal> flightBaselinePrices = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, BigDecimal> hotelBaselinePrices = new ConcurrentHashMap<>();

    public BaselinePriceCache(FlightRepository flightRepository, HotelRepository hotelRepository) {
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
    }

    @PostConstruct
    public void initBaselineCache() {
        try {
            flightRepository.findAll().forEach(flight -> {
                if (flight.getId() != null && flight.getPrice() != null) {
                    flightBaselinePrices.put(flight.getId(), flight.getPrice());
                }
            });
            hotelRepository.findAll().forEach(hotel -> {
                if (hotel.getId() != null && hotel.getPricePerNight() != null) {
                    hotelBaselinePrices.put(hotel.getId(), hotel.getPricePerNight());
                }
            });
            log.info("Initialized BaselinePriceCache with {} flights and {} hotels.",
                    flightBaselinePrices.size(), hotelBaselinePrices.size());
        } catch (Exception e) {
            log.warn("BaselinePriceCache startup initialization postponed or failed: {}", e.getMessage());
        }
    }

    public BigDecimal getFlightBaseline(Long flightId, BigDecimal fallbackPrice) {
        if (flightId == null) {
            return fallbackPrice != null ? fallbackPrice : BigDecimal.valueOf(5000.00);
        }
        return flightBaselinePrices.computeIfAbsent(flightId, id ->
                fallbackPrice != null ? fallbackPrice : BigDecimal.valueOf(5000.00));
    }

    public void putFlightBaseline(Long flightId, BigDecimal baselinePrice) {
        if (flightId != null && baselinePrice != null) {
            flightBaselinePrices.put(flightId, baselinePrice);
        }
    }

    public BigDecimal getHotelBaseline(Long hotelId, BigDecimal fallbackPrice) {
        if (hotelId == null) {
            return fallbackPrice != null ? fallbackPrice : BigDecimal.valueOf(3500.00);
        }
        return hotelBaselinePrices.computeIfAbsent(hotelId, id ->
                fallbackPrice != null ? fallbackPrice : BigDecimal.valueOf(3500.00));
    }

    public void putHotelBaseline(Long hotelId, BigDecimal baselinePrice) {
        if (hotelId != null && baselinePrice != null) {
            hotelBaselinePrices.put(hotelId, baselinePrice);
        }
    }

    public int getCachedFlightCount() {
        return flightBaselinePrices.size();
    }

    public int getCachedHotelCount() {
        return hotelBaselinePrices.size();
    }
}

