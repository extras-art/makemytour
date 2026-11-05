package com.makemytrip.makemytrip.adminpanel.dto;

import java.time.LocalDateTime;

public class AdminAuditLogDTO {

    private Long id;
    private LocalDateTime timestamp;
    private String adminEmail;
    private String action;
    private String entityType;
    private String entityId;
    private String details;

    public AdminAuditLogDTO() {}

    public AdminAuditLogDTO(Long id, LocalDateTime timestamp, String adminEmail,
                            String action, String entityType, String entityId, String details) {
        this.id = id;
        this.timestamp = timestamp;
        this.adminEmail = adminEmail;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.details = details;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}

