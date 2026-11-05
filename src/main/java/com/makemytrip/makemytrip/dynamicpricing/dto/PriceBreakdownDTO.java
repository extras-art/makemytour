package com.makemytrip.makemytrip.dynamicpricing.dto;

import java.util.List;

public class PriceBreakdownDTO {

    private Long entityId;
    private String entityType;
    private double basePrice;
    private double finalPrice;
    private double lowestPrice30d;
    private double highestPrice30d;
    private double demandMultiplierPct;
    private double seasonalMultiplierPct;
    private double scarcityMultiplierPct;
    private double timeHorizonMultiplierPct;
    private List<String> activeRuleBadges;
    private String explanationSummary;

    public PriceBreakdownDTO() {}

    public PriceBreakdownDTO(Long entityId, String entityType, double basePrice, double finalPrice,
                             double lowestPrice30d, double highestPrice30d,
                             double demandMultiplierPct, double seasonalMultiplierPct,
                             double scarcityMultiplierPct, double timeHorizonMultiplierPct,
                             List<String> activeRuleBadges, String explanationSummary) {
        this.entityId = entityId;
        this.entityType = entityType;
        this.basePrice = basePrice;
        this.finalPrice = finalPrice;
        this.lowestPrice30d = lowestPrice30d;
        this.highestPrice30d = highestPrice30d;
        this.demandMultiplierPct = demandMultiplierPct;
        this.seasonalMultiplierPct = seasonalMultiplierPct;
        this.scarcityMultiplierPct = scarcityMultiplierPct;
        this.timeHorizonMultiplierPct = timeHorizonMultiplierPct;
        this.activeRuleBadges = activeRuleBadges;
        this.explanationSummary = explanationSummary;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(double basePrice) {
        this.basePrice = basePrice;
    }

    public double getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(double finalPrice) {
        this.finalPrice = finalPrice;
    }

    public double getLowestPrice30d() {
        return lowestPrice30d;
    }

    public void setLowestPrice30d(double lowestPrice30d) {
        this.lowestPrice30d = lowestPrice30d;
    }

    public double getHighestPrice30d() {
        return highestPrice30d;
    }

    public void setHighestPrice30d(double highestPrice30d) {
        this.highestPrice30d = highestPrice30d;
    }

    public double getDemandMultiplierPct() {
        return demandMultiplierPct;
    }

    public void setDemandMultiplierPct(double demandMultiplierPct) {
        this.demandMultiplierPct = demandMultiplierPct;
    }

    public double getSeasonalMultiplierPct() {
        return seasonalMultiplierPct;
    }

    public void setSeasonalMultiplierPct(double seasonalMultiplierPct) {
        this.seasonalMultiplierPct = seasonalMultiplierPct;
    }

    public double getScarcityMultiplierPct() {
        return scarcityMultiplierPct;
    }

    public void setScarcityMultiplierPct(double scarcityMultiplierPct) {
        this.scarcityMultiplierPct = scarcityMultiplierPct;
    }

    public double getTimeHorizonMultiplierPct() {
        return timeHorizonMultiplierPct;
    }

    public void setTimeHorizonMultiplierPct(double timeHorizonMultiplierPct) {
        this.timeHorizonMultiplierPct = timeHorizonMultiplierPct;
    }

    public List<String> getActiveRuleBadges() {
        return activeRuleBadges;
    }

    public void setActiveRuleBadges(List<String> activeRuleBadges) {
        this.activeRuleBadges = activeRuleBadges;
    }

    public String getExplanationSummary() {
        return explanationSummary;
    }

    public void setExplanationSummary(String explanationSummary) {
        this.explanationSummary = explanationSummary;
    }
}

