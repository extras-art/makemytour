package com.makemytrip.makemytrip.adminpanel.service;

import com.makemytrip.makemytrip.adminpanel.dto.AdminAuditLogDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory ring-buffer audit log service.
 * Keeps the last MAX_ENTRIES admin actions in a thread-safe list.
 */
@Service
public class AdminAuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuditLogService.class);
    private static final int MAX_ENTRIES = 500;

    private final CopyOnWriteArrayList<AdminAuditLogDTO> buffer = new CopyOnWriteArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public void log(String adminEmail, String action, String entityType, String entityId, String details) {
        if (buffer.size() >= MAX_ENTRIES) {
            buffer.remove(0);
        }
        AdminAuditLogDTO entry = new AdminAuditLogDTO(
            idCounter.getAndIncrement(),
            LocalDateTime.now(),
            adminEmail,
            action,
            entityType,
            entityId,
            details
        );
        buffer.add(entry);
        log.info("[AUDIT] {} | {} | {} #{} | {}", adminEmail, action, entityType, entityId, details);
    }

    public List<AdminAuditLogDTO> getAll() {
        List<AdminAuditLogDTO> result = new ArrayList<>(buffer);
        result.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return result;
    }
}

