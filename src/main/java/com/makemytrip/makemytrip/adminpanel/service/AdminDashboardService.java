package com.makemytrip.makemytrip.adminpanel.service;

import com.makemytrip.makemytrip.adminpanel.dto.*;
import com.makemytrip.makemytrip.models.Booking;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.sqldailyupdate.service.DailyInventoryUpdateService;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final DailyInventoryUpdateService dailyInventoryUpdateService;

    public AdminDashboardService(
        UserRepository userRepository,
        FlightRepository flightRepository,
        HotelRepository hotelRepository,
        BookingRepository bookingRepository,
        DailyInventoryUpdateService dailyInventoryUpdateService
    ) {
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
        this.dailyInventoryUpdateService = dailyInventoryUpdateService;
    }

    public AdminOverviewStatsDTO buildOverview() {
        AdminOverviewStatsDTO stats = new AdminOverviewStatsDTO();

        List<com.makemytrip.makemytrip.models.Users> allUsers = userRepository.findAll();
        stats.setTotalUsers(allUsers.size());

        List<com.makemytrip.makemytrip.models.Flight> allFlights = flightRepository.findAll();
        long activeFlights = allFlights.stream().filter(f -> Boolean.TRUE.equals(f.getActive())).count();
        stats.setTotalFlights(allFlights.size());
        stats.setActiveFlights(activeFlights);
        stats.setInactiveFlights(allFlights.size() - activeFlights);

        List<com.makemytrip.makemytrip.models.Hotel> allHotels = hotelRepository.findAll();
        long activeHotels = allHotels.stream().filter(h -> Boolean.TRUE.equals(h.getActive())).count();
        stats.setTotalHotels(allHotels.size());
        stats.setActiveHotels(activeHotels);
        stats.setInactiveHotels(allHotels.size() - activeHotels);

        List<Booking> allBookings = bookingRepository.findAll();
        stats.setTotalBookings(allBookings.size());
        stats.setConfirmedBookings(allBookings.stream().filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus())).count());
        stats.setCancelledBookings(allBookings.stream().filter(b -> "CANCELLED".equalsIgnoreCase(b.getStatus())).count());
        stats.setRefundPendingBookings(allBookings.stream().filter(b -> "REFUND_PENDING".equalsIgnoreCase(b.getStatus())).count());
        stats.setRefundedBookings(allBookings.stream().filter(b -> "REFUNDED".equalsIgnoreCase(b.getStatus())).count());

        // Recent 5 registrations (sorted by createdAt desc)
        List<AdminUserDTO> recentUsers = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null)
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(5)
            .map(AdminUserDTO::from)
            .collect(Collectors.toList());
        stats.setRecentRegistrations(recentUsers);

        // Recent 5 bookings
        List<AdminOverviewStatsDTO.AdminBookingSummaryDTO> recentBookings = allBookings.stream()
            .filter(b -> b.getCreatedAt() != null)
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(5)
            .map(b -> {
                AdminOverviewStatsDTO.AdminBookingSummaryDTO s = new AdminOverviewStatsDTO.AdminBookingSummaryDTO();
                s.setId(b.getId());
                if (b.getUser() != null) {
                    s.setCustomerName(b.getUser().getName());
                    s.setCustomerEmail(b.getUser().getEmail());
                }
                if (b.getFlight() != null) {
                    s.setType("FLIGHT");
                    s.setEntityName(b.getFlight().getAirline());
                } else if (b.getHotel() != null) {
                    s.setType("HOTEL");
                    s.setEntityName(b.getHotel().getName());
                }
                s.setTotalPrice(b.getTotalPrice() != null ? b.getTotalPrice().doubleValue() : 0.0);
                s.setStatus(b.getStatus());
                s.setCreatedAt(b.getCreatedAt().format(FORMATTER));
                return s;
            })
            .collect(Collectors.toList());
        stats.setRecentBookings(recentBookings);

        stats.setLastInventorySummary(dailyInventoryUpdateService.getLastSummary());

        return stats;
    }
}

