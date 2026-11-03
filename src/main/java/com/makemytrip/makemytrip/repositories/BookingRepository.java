package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser_Id(Long userId);
    Optional<Booking> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT DISTINCT b.flight.id FROM Booking b WHERE b.flight.id IS NOT NULL")
    List<Long> findDistinctBookedFlightIds();

    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b WHERE b.flight.id = :flightId AND (b.status IS NULL OR b.status != 'CANCELLED')")
    Integer countReservedSeatsByFlightId(@Param("flightId") Long flightId);

    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b WHERE b.hotel.id = :hotelId AND (b.status IS NULL OR b.status != 'CANCELLED')")
    Integer countReservedRoomsByHotelId(@Param("hotelId") Long hotelId);
}
