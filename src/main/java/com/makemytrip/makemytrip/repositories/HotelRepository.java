package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByCityIgnoreCase(String city);

    List<Hotel> findByActiveTrue();

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM Hotel h WHERE h.id = :id")
    java.util.Optional<Hotel> findByIdWithLock(@Param("id") Long id);

    @Query("""
        SELECT h FROM Hotel h
        WHERE (:city IS NULL OR :city = '' OR LOWER(h.city) = LOWER(:city))
          AND (:rooms IS NULL OR h.availableRooms >= :rooms)
          AND (:minRating IS NULL OR h.starRating >= :minRating)
          AND (h.active = true)
    """)
    Page<Hotel> searchHotels(
        @Param("city") String city,
        @Param("rooms") Integer rooms,
        @Param("minRating") Integer minRating,
        Pageable pageable
    );
}