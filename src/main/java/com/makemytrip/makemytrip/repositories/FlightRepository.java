package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.Flight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    List<Flight> findBySourceIgnoreCaseAndDestinationIgnoreCase(
        String source, String destination
    );

    List<Flight> findByActiveTrue();

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Flight f WHERE f.id = :id")
    java.util.Optional<Flight> findByIdWithLock(@Param("id") Long id);

    @Query("""
        SELECT f FROM Flight f
        WHERE (:source IS NULL OR :source = '' OR LOWER(f.source) = LOWER(:source))
          AND (:destination IS NULL OR :destination = '' OR LOWER(f.destination) = LOWER(:destination))
          AND (:startDate IS NULL OR f.departureTime >= :startDate)
          AND (:endDate IS NULL OR f.departureTime < :endDate)
          AND (:passengers IS NULL OR f.availableSeats >= :passengers)
          AND (f.active = true)
    """)
    Page<Flight> searchFlights(
        @Param("source") String source,
        @Param("destination") String destination,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("passengers") Integer passengers,
        Pageable pageable
    );

    @Query("""
        SELECT f FROM Flight f
        WHERE (:source IS NULL OR :source = '' OR LOWER(f.source) = LOWER(:source))
          AND (:destination IS NULL OR :destination = '' OR LOWER(f.destination) = LOWER(:destination))
          AND (:startDate IS NULL OR f.departureTime >= :startDate)
          AND (:endDate IS NULL OR f.departureTime < :endDate)
          AND (:passengers IS NULL OR f.availableSeats >= :passengers)
          AND (f.active = true)
    """)
    List<Flight> searchFlightsList(
        @Param("source") String source,
        @Param("destination") String destination,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("passengers") Integer passengers
    );
}