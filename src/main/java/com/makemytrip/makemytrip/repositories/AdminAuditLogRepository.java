package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
    List<AdminAuditLog> findAllByOrderByCreatedAtDesc();
    Page<AdminAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
