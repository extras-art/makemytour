package com.makemytrip.makemytrip.sqldailyupdate.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.inventory.refresh")
public class InventoryUpdateProperties {

    private boolean enabled = true;
    private String cron = "0 0 0 * * *";
    private String timezone = "Asia/Kolkata";
    private FlightProperties flight = new FlightProperties();

    public static class FlightProperties {
        private int minDaysAhead = 7;
        private int horizonDays = 60;

        public int getMinDaysAhead() {
            return minDaysAhead;
        }

        public void setMinDaysAhead(int minDaysAhead) {
            this.minDaysAhead = minDaysAhead;
        }

        public int getHorizonDays() {
            return horizonDays;
        }

        public void setHorizonDays(int horizonDays) {
            this.horizonDays = horizonDays;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getCron() {
        return cron;
    }

    public void setCron(String cron) {
        this.cron = cron;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public FlightProperties getFlight() {
        return flight;
    }

    public void setFlight(FlightProperties flight) {
        this.flight = flight;
    }
}

