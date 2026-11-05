package com.makemytrip.makemytrip.dynamicpricing;

import com.makemytrip.makemytrip.dynamicpricing.dto.PriceBreakdownDTO;
import com.makemytrip.makemytrip.dynamicpricing.dto.PriceLockResponseDTO;
import com.makemytrip.makemytrip.dynamicpricing.model.EntityType;
import com.makemytrip.makemytrip.dynamicpricing.model.PriceLock;
import com.makemytrip.makemytrip.dynamicpricing.repository.PriceHistoryRepository;
import com.makemytrip.makemytrip.dynamicpricing.repository.PriceLockRepository;
import com.makemytrip.makemytrip.dynamicpricing.service.DynamicPricingEngineService;
import com.makemytrip.makemytrip.dynamicpricing.service.PriceFreezeService;
import com.makemytrip.makemytrip.dynamicpricing.service.SeasonalCalendarHelper;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.sqldailyupdate.service.BaselinePriceCache;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DynamicPricingEngineTest {

    @Mock
    private BaselinePriceCache baselinePriceCache;

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PriceHistoryRepository priceHistoryRepository;

    @Mock
    private PriceLockRepository priceLockRepository;

    private SeasonalCalendarHelper seasonalCalendarHelper;
    private DynamicPricingEngineService pricingEngineService;
    private PriceFreezeService priceFreezeService;

    @BeforeEach
    void setUp() {
        seasonalCalendarHelper = new SeasonalCalendarHelper();
        pricingEngineService = new DynamicPricingEngineService(
                baselinePriceCache,
                flightRepository,
                hotelRepository,
                bookingRepository,
                priceHistoryRepository,
                priceLockRepository,
                seasonalCalendarHelper
        );
        priceFreezeService = new PriceFreezeService(priceLockRepository, pricingEngineService);
    }

    @Test
    @DisplayName("Multiplier Caps & Baseline Anchor Safety: Final price stays strictly within [0.85x, 1.65x]")
    void testMultiplierCapsAndBaselineAnchor() {
        Flight flight = new Flight();
        flight.setId(101L);
        flight.setAirline("Indigo");
        flight.setPrice(BigDecimal.valueOf(5000.00));
        flight.setAvailableSeats(5); // <15 seats: +18% scarcity
        flight.setDepartureTime(LocalDateTime.now().plusDays(1)); // <=3 days: +20% last-minute

        when(flightRepository.findById(101L)).thenReturn(Optional.of(flight));
        when(baselinePriceCache.getFlightBaseline(eq(101L), any())).thenReturn(BigDecimal.valueOf(5000.00));
        when(bookingRepository.countReservedSeatsByFlightId(101L)).thenReturn(20); // >10 bookings: +12%
        when(priceLockRepository.countActiveLocks(eq(EntityType.FLIGHT), eq(101L), any())).thenReturn(3L); // +6% velocity

        PriceBreakdownDTO breakdown = pricingEngineService.computeBreakdown(EntityType.FLIGHT, 101L);

        assertNotNull(breakdown);
        assertEquals(5000.0, breakdown.getBasePrice());
        assertTrue(breakdown.getFinalPrice() <= 5000.0 * 1.65 + 0.01, "Final price should be capped at 1.65x base price");
        assertTrue(breakdown.getFinalPrice() >= 5000.0 * 0.85 - 0.01, "Final price should be at least 0.85x base price");
    }

    @Test
    @DisplayName("Hotel Scarcity & Availability Multipliers Calculation")
    void testHotelScarcityCalculations() {
        Hotel hotel = new Hotel();
        hotel.setId(202L);
        hotel.setName("Taj Bengal");
        hotel.setCity("Kolkata");
        hotel.setPricePerNight(BigDecimal.valueOf(4000.00));
        hotel.setAvailableRooms(3); // <5 rooms: +15% scarcity

        when(hotelRepository.findById(202L)).thenReturn(Optional.of(hotel));
        when(baselinePriceCache.getHotelBaseline(eq(202L), any())).thenReturn(BigDecimal.valueOf(4000.00));
        when(bookingRepository.countReservedRoomsByHotelId(202L)).thenReturn(0);
        when(priceLockRepository.countActiveLocks(eq(EntityType.HOTEL), eq(202L), any())).thenReturn(0L);

        PriceBreakdownDTO breakdown = pricingEngineService.computeBreakdown(EntityType.HOTEL, 202L);

        assertNotNull(breakdown);
        assertEquals(4000.0, breakdown.getBasePrice());
        assertEquals(15.0, breakdown.getScarcityMultiplierPct());
    }

    @Test
    @DisplayName("30-Minute Price Freeze Creation and Expiration Validation")
    void testPriceFreezeCreationAndActiveCheck() {
        Flight flight = new Flight();
        flight.setId(101L);
        flight.setAirline("Indigo");
        flight.setPrice(BigDecimal.valueOf(5000.00));
        flight.setAvailableSeats(50);
        flight.setDepartureTime(LocalDateTime.now().plusDays(10));

        when(flightRepository.findById(101L)).thenReturn(Optional.of(flight));
        when(baselinePriceCache.getFlightBaseline(eq(101L), any())).thenReturn(BigDecimal.valueOf(5000.00));
        when(priceLockRepository.findFirstByUserIdAndEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
                eq(1L), eq(EntityType.FLIGHT), eq(101L), any()))
                .thenReturn(Optional.empty());

        PriceLockResponseDTO lockResp = priceFreezeService.createLock(1L, EntityType.FLIGHT, 101L);

        assertNotNull(lockResp);
        assertNotNull(lockResp.getLockId());
        assertTrue(lockResp.getRemainingSeconds() <= 1800 && lockResp.getRemainingSeconds() > 1700);
        verify(priceLockRepository, times(1)).save(any(PriceLock.class));
    }

    @Test
    @DisplayName("Checkout Locked-Price Resolution: Active lock applies locked rate & marks used")
    void testResolveEffectiveUnitPriceWithActiveLock() {
        PriceLock activeLock = new PriceLock(
                "lock-uuid-123",
                1L,
                EntityType.FLIGHT,
                101L,
                BigDecimal.valueOf(4500.00),
                LocalDateTime.now().plusMinutes(20)
        );

        when(priceLockRepository.findFirstByUserIdAndEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
                eq(1L), eq(EntityType.FLIGHT), eq(101L), any()))
                .thenReturn(Optional.of(activeLock));

        BigDecimal currentEntityPrice = BigDecimal.valueOf(5800.00); // Live price spiked
        BigDecimal resolved = priceFreezeService.resolveEffectiveUnitPrice(1L, EntityType.FLIGHT, 101L, currentEntityPrice);

        assertEquals(BigDecimal.valueOf(4500.00), resolved, "Checkout should use locked price instead of spiked price");
        assertTrue(activeLock.isUsed(), "Lock should be marked as used");
        verify(priceLockRepository, times(1)).save(activeLock);
    }

    @Test
    @DisplayName("Checkout Price Resolution: Without active lock, live price is returned")
    void testResolveEffectiveUnitPriceWithoutLock() {
        when(priceLockRepository.findFirstByUserIdAndEntityTypeAndEntityIdAndUsedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
                eq(1L), eq(EntityType.FLIGHT), eq(101L), any()))
                .thenReturn(Optional.empty());

        BigDecimal livePrice = BigDecimal.valueOf(5500.00);
        BigDecimal resolved = priceFreezeService.resolveEffectiveUnitPrice(1L, EntityType.FLIGHT, 101L, livePrice);

        assertEquals(livePrice, resolved);
    }
}

