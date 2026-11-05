package com.makemytrip.makemytrip.cancellationrefund.repository;

import com.makemytrip.makemytrip.cancellationrefund.model.BookingCancellationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingCancellationRepository extends JpaRepository<BookingCancellationRecord, Long> {

    Optional<BookingCancellationRecord> findByBookingId(Long bookingId);

    Optional<BookingCancellationRecord> findTopByBookingIdOrderByCancelledAtDesc(Long bookingId);

    List<BookingCancellationRecord> findByUserIdOrderByCancelledAtDesc(Long userId);

    List<BookingCancellationRecord> findAllByOrderByCancelledAtDesc();

    @Query("SELECT r.reason, COUNT(r) FROM BookingCancellationRecord r GROUP BY r.reason")
    List<Object[]> countGroupedByReason();
}

