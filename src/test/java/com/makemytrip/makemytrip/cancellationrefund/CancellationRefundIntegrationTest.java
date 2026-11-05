package com.makemytrip.makemytrip.cancellationrefund;

import com.makemytrip.makemytrip.cancellationrefund.dto.CancelBookingRequestDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.CancellationRefundTrackerDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.CancellationTrendStatsDTO;
import com.makemytrip.makemytrip.cancellationrefund.dto.RefundQuoteDTO;
import com.makemytrip.makemytrip.cancellationrefund.model.BookingCancellationRecord;
import com.makemytrip.makemytrip.cancellationrefund.model.CancellationReasonEnum;
import com.makemytrip.makemytrip.cancellationrefund.model.RefundStatusEnum;
import com.makemytrip.makemytrip.cancellationrefund.repository.BookingCancellationRepository;
import com.makemytrip.makemytrip.cancellationrefund.service.BookingCancellationService;
import com.makemytrip.makemytrip.cancellationrefund.service.RefundPolicyCalculatorService;
import com.makemytrip.makemytrip.features.flightstatus.dto.FlightStatusUpdateDTO;
import com.makemytrip.makemytrip.features.flightstatus.model.FlightStatusEnum;
import com.makemytrip.makemytrip.features.flightstatus.service.FlightStatusSimulatorService;
import com.makemytrip.makemytrip.models.Booking;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CancellationRefundIntegrationTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingCancellationRepository cancellationRepository;

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FlightStatusSimulatorService flightStatusSimulatorService;

    private RefundPolicyCalculatorService calculatorService;
    private BookingCancellationService cancellationService;

    private Users testUser;
    private Flight testFlight;
    private Hotel testHotel;

    @BeforeEach
    void setUp() {
        calculatorService = new RefundPolicyCalculatorService(flightStatusSimulatorService);
        cancellationService = new BookingCancellationService(
                bookingRepository,
                cancellationRepository,
                flightRepository,
                hotelRepository,
                userRepository,
                calculatorService
        );

        testUser = new Users();
        testUser.setId(100L);
        testUser.setEmail("traveler@example.com");
        testUser.setRole("ROLE_USER");

        testFlight = new Flight();
        testFlight.setId(10L);
        testFlight.setAirline("Air India");
        testFlight.setSource("DEL");
        testFlight.setDestination("BOM");
        testFlight.setPrice(BigDecimal.valueOf(5000.00));
        testFlight.setAvailableSeats(50);
        testFlight.setActive(true);

        testHotel = new Hotel();
        testHotel.setId(20L);
        testHotel.setName("Grand Palace");
        testHotel.setCity("Mumbai");
        testHotel.setPricePerNight(BigDecimal.valueOf(4000.00));
        testHotel.setAvailableRooms(15);
        testHotel.setActive(true);
    }

    @Test
    @DisplayName("Tier 1: Early Cancellation (> 168 hours) -> 90% Refund, 10% Cancellation Fee")
    void testEarlyCancellation90PercentTier() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setUser(testUser);
        booking.setFlight(testFlight);
        booking.setQuantity(2);
        booking.setTotalPrice(BigDecimal.valueOf(10000.00));
        testFlight.setDepartureTime(LocalDateTime.now().plusDays(10)); // 240 hours > 168 hours

        RefundQuoteDTO quote = calculatorService.calculateQuote(booking, 2, CancellationReasonEnum.CHANGE_OF_PLANS);

        assertNotNull(quote);
        assertEquals(90, quote.getRefundPercentage());
        assertEquals("Early Cancellation Tier (90% Refund)", quote.getPolicyAppliedLabel());
        assertEquals(new BigDecimal("10000.00"), quote.getCancelledPortionAmount());
        assertEquals(new BigDecimal("9000.00"), quote.getNetRefundAmount());
        assertEquals(new BigDecimal("1000.00"), quote.getCancellationFee());
    }

    @Test
    @DisplayName("Tier 2: Standard Window (24h - 168h) -> 75% Refund, 25% Cancellation Fee")
    void testStandardWindow75PercentTier() {
        Booking booking = new Booking();
        booking.setId(2L);
        booking.setUser(testUser);
        booking.setFlight(testFlight);
        booking.setQuantity(1);
        booking.setTotalPrice(BigDecimal.valueOf(5000.00));
        testFlight.setDepartureTime(LocalDateTime.now().plusHours(48)); // 48h -> between 24 and 168

        RefundQuoteDTO quote = calculatorService.calculateQuote(booking, 1, CancellationReasonEnum.FOUND_BETTER_PRICE);

        assertEquals(75, quote.getRefundPercentage());
        assertEquals("Standard Window Tier (75% Refund)", quote.getPolicyAppliedLabel());
        assertEquals(new BigDecimal("5000.00"), quote.getCancelledPortionAmount());
        assertEquals(new BigDecimal("3750.00"), quote.getNetRefundAmount());
        assertEquals(new BigDecimal("1250.00"), quote.getCancellationFee());
    }

    @Test
    @DisplayName("Tier 3: Last-Minute Window (< 24 hours) -> 50% Refund, 50% Cancellation Fee")
    void testLastMinute50PercentTier() {
        Booking booking = new Booking();
        booking.setId(3L);
        booking.setUser(testUser);
        booking.setFlight(testFlight);
        booking.setQuantity(1);
        booking.setTotalPrice(BigDecimal.valueOf(6000.00));
        testFlight.setDepartureTime(LocalDateTime.now().plusHours(12)); // 12h < 24h

        RefundQuoteDTO quote = calculatorService.calculateQuote(booking, 1, CancellationReasonEnum.OTHER);

        assertEquals(50, quote.getRefundPercentage());
        assertEquals("Within 24-Hour Policy Tier (50% Refund)", quote.getPolicyAppliedLabel());
        assertEquals(new BigDecimal("6000.00"), quote.getCancelledPortionAmount());
        assertEquals(new BigDecimal("3000.00"), quote.getNetRefundAmount());
        assertEquals(new BigDecimal("3000.00"), quote.getCancellationFee());
    }

    @Test
    @DisplayName("Bonus Waiver: Operational Delay Override -> 100% Full Refund")
    void testOperationalDelayWaiver100Percent() {
        Booking booking = new Booking();
        booking.setId(4L);
        booking.setUser(testUser);
        booking.setFlight(testFlight);
        booking.setQuantity(1);
        booking.setTotalPrice(BigDecimal.valueOf(8000.00));
        testFlight.setDepartureTime(LocalDateTime.now().plusHours(5)); // within 24h normally 50%

        FlightStatusUpdateDTO delayedStatus = new FlightStatusUpdateDTO();
        delayedStatus.setStatus(FlightStatusEnum.DELAYED);
        delayedStatus.setDelayMinutes(120);

        when(flightStatusSimulatorService.getStatus(testFlight.getId())).thenReturn(delayedStatus);

        RefundQuoteDTO quote = calculatorService.calculateQuote(
                booking, 1, CancellationReasonEnum.FLIGHT_DELAY_OR_RESCHEDULE);

        assertEquals(100, quote.getRefundPercentage());
        assertEquals("Operational Delay Waiver — 100% Refund", quote.getPolicyAppliedLabel());
        assertEquals(new BigDecimal("8000.00"), quote.getNetRefundAmount());
        assertEquals(new BigDecimal("0.00"), quote.getCancellationFee());
        assertTrue(quote.isOperationalDelayWaiver());
    }

    @Test
    @DisplayName("Partial Cancellation Math & Inventory Restoration (cancelling 2 of 4 seats)")
    void testPartialCancellationMathAndInventoryRestoration() {
        Booking booking = new Booking();
        booking.setId(5L);
        booking.setUser(testUser);
        booking.setFlight(testFlight);
        booking.setQuantity(4);
        booking.setTotalPrice(BigDecimal.valueOf(20000.00));
        booking.setStatus("CONFIRMED");
        testFlight.setAvailableSeats(46); // 50 total minus 4 reserved
        testFlight.setDepartureTime(LocalDateTime.now().plusDays(10)); // 90% tier

        when(bookingRepository.findById(5L)).thenReturn(Optional.of(booking));
        when(flightRepository.findByIdWithLock(testFlight.getId())).thenReturn(Optional.of(testFlight));
        when(cancellationRepository.save(any(BookingCancellationRecord.class))).thenAnswer(i -> {
            BookingCancellationRecord r = i.getArgument(0);
            r.setId(99L);
            return r;
        });

        CancelBookingRequestDTO req = new CancelBookingRequestDTO();
        req.setBookingId(5L);
        req.setQuantityToCancel(2);
        req.setReason(CancellationReasonEnum.CHANGE_OF_PLANS);

        CancellationRefundTrackerDTO result = cancellationService.executeCancellation(req, "traveler@example.com");

        assertNotNull(result);
        assertEquals(2, result.getCancelledQuantity());
        assertEquals(new BigDecimal("10000.00"), result.getCancelledPortionAmount());
        assertEquals(new BigDecimal("9000.00"), result.getRefundAmount()); // 90% of 10000

        // Verify remaining booking state
        assertEquals("PARTIALLY_CANCELLED", booking.getStatus());
        assertEquals(2, booking.getQuantity()); // 4 - 2 = 2
        assertEquals(new BigDecimal("10000.00"), booking.getTotalPrice()); // 20000 - 10000 = 10000

        // Verify exact restoration of Flight inventory: 46 + 2 = 48 seats
        assertEquals(48, testFlight.getAvailableSeats());
        verify(flightRepository).save(testFlight);
        verify(bookingRepository).save(booking);
    }

    @Test
    @DisplayName("Hotel Inventory Restoration (Full cancellation restores all reserved rooms)")
    void testHotelCancellationInventoryRestoration() {
        Booking booking = new Booking();
        booking.setId(6L);
        booking.setUser(testUser);
        booking.setHotel(testHotel);
        booking.setQuantity(3);
        booking.setCheckInDate(LocalDate.now().plusDays(14));
        booking.setTotalPrice(BigDecimal.valueOf(12000.00));
        booking.setStatus("CONFIRMED");
        testHotel.setAvailableRooms(12); // was 15, 3 booked

        when(bookingRepository.findById(6L)).thenReturn(Optional.of(booking));
        when(hotelRepository.findByIdWithLock(testHotel.getId())).thenReturn(Optional.of(testHotel));
        when(cancellationRepository.save(any())).thenAnswer(i -> {
            BookingCancellationRecord r = i.getArgument(0);
            r.setId(101L);
            return r;
        });

        CancelBookingRequestDTO req = new CancelBookingRequestDTO();
        req.setBookingId(6L);
        req.setQuantityToCancel(3);
        req.setReason(CancellationReasonEnum.BOOKED_BY_MISTAKE);

        CancellationRefundTrackerDTO result = cancellationService.executeCancellation(req, "traveler@example.com");

        assertEquals("CANCELLED", booking.getStatus());
        assertNotNull(booking.getCancelledAt());
        // Verify 12 + 3 = 15 rooms restored
        assertEquals(15, testHotel.getAvailableRooms());
        verify(hotelRepository).save(testHotel);
    }

    @Test
    @DisplayName("Status Progression (PENDING -> PROCESSED -> COMPLETED) and Booking Sync")
    void testRefundStatusProgressionAndSync() {
        Booking booking = new Booking();
        booking.setId(7L);
        booking.setStatus("CANCELLED");

        BookingCancellationRecord record = new BookingCancellationRecord();
        record.setId(55L);
        record.setBookingId(7L);
        record.setRefundStatus(RefundStatusEnum.PENDING);
        record.setRefundAmount(BigDecimal.valueOf(4500.00));

        when(cancellationRepository.findById(55L)).thenReturn(Optional.of(record));
        when(bookingRepository.findById(7L)).thenReturn(Optional.of(booking));
        when(cancellationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Step 1: Admin marks PROCESSED
        CancellationRefundTrackerDTO processed = cancellationService.updateRefundStatus(55L, RefundStatusEnum.PROCESSED);
        assertEquals(RefundStatusEnum.PROCESSED, processed.getRefundStatus());
        assertNotNull(processed.getProcessedAt());
        assertEquals("REFUND_PENDING", booking.getStatus());

        // Step 2: Admin marks COMPLETED
        CancellationRefundTrackerDTO completed = cancellationService.updateRefundStatus(55L, RefundStatusEnum.COMPLETED);
        assertEquals(RefundStatusEnum.COMPLETED, completed.getRefundStatus());
        assertNotNull(completed.getCompletedAt());
        assertEquals("REFUNDED", booking.getStatus());
    }

    @Test
    @DisplayName("Reason Analytics Aggregation counts and financial totals")
    void testReasonAnalyticsAggregation() {
        BookingCancellationRecord r1 = new BookingCancellationRecord();
        r1.setReason(CancellationReasonEnum.CHANGE_OF_PLANS);
        r1.setRefundStatus(RefundStatusEnum.COMPLETED);
        r1.setRefundAmount(BigDecimal.valueOf(5000.00));

        BookingCancellationRecord r2 = new BookingCancellationRecord();
        r2.setReason(CancellationReasonEnum.CHANGE_OF_PLANS);
        r2.setRefundStatus(RefundStatusEnum.PENDING);
        r2.setRefundAmount(BigDecimal.valueOf(3000.00));

        BookingCancellationRecord r3 = new BookingCancellationRecord();
        r3.setReason(CancellationReasonEnum.FLIGHT_DELAY_OR_RESCHEDULE);
        r3.setRefundStatus(RefundStatusEnum.COMPLETED);
        r3.setRefundAmount(BigDecimal.valueOf(8000.00));

        when(cancellationRepository.findAll()).thenReturn(List.of(r1, r2, r3));

        CancellationTrendStatsDTO stats = cancellationService.getReasonAnalytics();

        assertNotNull(stats);
        assertEquals(3, stats.getTotalCancellations());
        assertEquals(2L, stats.getReasonCounts().get(CancellationReasonEnum.CHANGE_OF_PLANS.name()));
        assertEquals(1L, stats.getReasonCounts().get(CancellationReasonEnum.FLIGHT_DELAY_OR_RESCHEDULE.name()));
        assertEquals(0, new BigDecimal("13000.00").compareTo(stats.getTotalRefundedAmount()));
        assertEquals(1, stats.getPendingRefundsCount());
        assertEquals(2, stats.getCompletedRefundsCount());
    }
}
