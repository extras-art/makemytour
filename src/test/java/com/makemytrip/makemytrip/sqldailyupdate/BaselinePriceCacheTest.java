package com.makemytrip.makemytrip.sqldailyupdate;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.sqldailyupdate.service.BaselinePriceCache;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BaselinePriceCacheTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private HotelRepository hotelRepository;

    private BaselinePriceCache cache;

    @BeforeEach
    void setUp() {
        cache = new BaselinePriceCache(flightRepository, hotelRepository);
    }

    @Test
    void testInitBaselineCache_PopulatesFromRepositories() {
        Flight f1 = new Flight();
        f1.setId(10L);
        f1.setPrice(BigDecimal.valueOf(4500.00));

        Hotel h1 = new Hotel();
        h1.setId(20L);
        h1.setPricePerNight(BigDecimal.valueOf(3200.00));

        when(flightRepository.findAll()).thenReturn(List.of(f1));
        when(hotelRepository.findAll()).thenReturn(List.of(h1));

        cache.initBaselineCache();

        assertEquals(1, cache.getCachedFlightCount());
        assertEquals(1, cache.getCachedHotelCount());

        assertEquals(BigDecimal.valueOf(4500.00), cache.getFlightBaseline(10L, null));
        assertEquals(BigDecimal.valueOf(3200.00), cache.getHotelBaseline(20L, null));
    }

    @Test
    void testPutFlightBaseline_AndGetFallback() {
        cache.putFlightBaseline(99L, BigDecimal.valueOf(6000.00));
        assertEquals(BigDecimal.valueOf(6000.00), cache.getFlightBaseline(99L, BigDecimal.valueOf(1000.00)));

        // Uncached flight computes from fallback
        BigDecimal fallback = cache.getFlightBaseline(888L, BigDecimal.valueOf(7500.00));
        assertEquals(BigDecimal.valueOf(7500.00), fallback);
    }

    @Test
    void testPutHotelBaseline_AndGetFallback() {
        cache.putHotelBaseline(55L, BigDecimal.valueOf(4200.00));
        assertEquals(BigDecimal.valueOf(4200.00), cache.getHotelBaseline(55L, BigDecimal.valueOf(1000.00)));

        // Uncached hotel computes from fallback
        BigDecimal fallback = cache.getHotelBaseline(777L, BigDecimal.valueOf(2500.00));
        assertEquals(BigDecimal.valueOf(2500.00), fallback);
    }
}

