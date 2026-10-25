package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser_Id(Long userId);
    java.util.Optional<Booking> findByIdempotencyKey(String idempotencyKey);
}
