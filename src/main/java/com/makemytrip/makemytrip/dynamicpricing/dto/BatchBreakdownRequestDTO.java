package com.makemytrip.makemytrip.dynamicpricing.dto;

import java.util.List;

public class BatchBreakdownRequestDTO {

    private String entityType;
    private List<Long> entityIds;

    public BatchBreakdownRequestDTO() {}

    public BatchBreakdownRequestDTO(String entityType, List<Long> entityIds) {
        this.entityType = entityType;
        this.entityIds = entityIds;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public List<Long> getEntityIds() {
        return entityIds;
    }

    public void setEntityIds(List<Long> entityIds) {
        this.entityIds = entityIds;
    }
}

