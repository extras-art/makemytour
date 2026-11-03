package com.makemytrip.makemytrip.sqldailyupdate.service;

import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.sqldailyupdate.generator.InventoryDataGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class HotelInventoryUpdateService {

    private static final Logger log = LoggerFactory.getLogger(HotelInventoryUpdateService.class);

    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final BaselinePriceCache baselinePriceCache;
    private final InventoryDataGenerator dataGenerator;

    public HotelInventoryUpdateService(
        HotelRepository hotelRepository,
        BookingRepository bookingRepository,
        BaselinePriceCache baselinePriceCache,
        InventoryDataGenerator dataGenerator
    ) {
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
        this.baselinePriceCache = baselinePriceCache;
        this.dataGenerator = dataGenerator;
    }

    @Transactional
    public List<Long> refreshHotelInventory() {
        List<Hotel> activeHotels = hotelRepository.findByActiveTrue();
        List<Long> updatedHotelIds = new ArrayList<>();
        log.info("Refreshing inventory for {} active hotels.", activeHotels.size());

        for (Hotel hotel : activeHotels) {
            Long hotelId = hotel.getId();

            // 1. Anchored price fluctuation (±5% to 10%)
            BigDecimal baseline = baselinePriceCache.getHotelBaseline(hotelId, hotel.getPricePerNight());
            BigDecimal newPrice = dataGenerator.fluctuateHotelPrice(baseline);
            hotel.setPricePerNight(newPrice);

            // 2. Refresh available rooms (10-50), ensuring never below active booked quantities
            Integer reservedRooms = bookingRepository.countReservedRoomsByHotelId(hotelId);
            int safeReserved = reservedRooms != null ? reservedRooms : 0;
            int randomRooms = dataGenerator.generateAvailableRooms();
            hotel.setAvailableRooms(Math.max(randomRooms, safeReserved));

            hotelRepository.save(hotel);
            updatedHotelIds.add(hotelId);
        }

        return updatedHotelIds;
    }
}

