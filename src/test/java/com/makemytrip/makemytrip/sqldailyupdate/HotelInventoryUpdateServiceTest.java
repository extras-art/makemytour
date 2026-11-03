package com.makemytrip.makemytrip.sqldailyupdate;

import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.sqldailyupdate.generator.InventoryDataGenerator;
import com.makemytrip.makemytrip.sqldailyupdate.service.BaselinePriceCache;
import com.makemytrip.makemytrip.sqldailyupdate.service.HotelInventoryUpdateService;
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
class HotelInventoryUpdateServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BaselinePriceCache baselinePriceCache;

    @Mock
    private InventoryDataGenerator dataGenerator;

    private HotelInventoryUpdateService service;

    @BeforeEach
    void setUp() {
        service = new HotelInventoryUpdateService(
                hotelRepository,
                bookingRepository,
                baselinePriceCache,
                dataGenerator
        );
    }

    @Test
    void testRefreshHotelInventory_AnchoredPriceAndBoundedRooms() {
        Hotel h1 = new Hotel();
        h1.setId(10L);
        h1.setName("Taj Mahal Palace");
        h1.setCity("Mumbai");
        h1.setPricePerNight(BigDecimal.valueOf(12000.00));
        h1.setAvailableRooms(25);
        h1.setActive(true);

        when(hotelRepository.findByActiveTrue()).thenReturn(List.of(h1));
        when(baselinePriceCache.getHotelBaseline(eq(10L), any())).thenReturn(BigDecimal.valueOf(12000.00));
        when(dataGenerator.fluctuateHotelPrice(BigDecimal.valueOf(12000.00))).thenReturn(BigDecimal.valueOf(12800.00));
        when(bookingRepository.countReservedRoomsByHotelId(10L)).thenReturn(20);
        when(dataGenerator.generateAvailableRooms()).thenReturn(15); // Random generated 15, but reserved is 20

        List<Long> updated = service.refreshHotelInventory();

        assertEquals(List.of(10L), updated);
        assertEquals(BigDecimal.valueOf(12800.00), h1.getPricePerNight());
        // Available rooms must never drop below active reserved quantity (20)
        assertEquals(20, h1.getAvailableRooms());
        assertTrue(h1.getActive());

        verify(hotelRepository, never()).delete(any());
        verify(hotelRepository, never()).deleteById(any());
        verify(hotelRepository).save(h1);
    }
}

