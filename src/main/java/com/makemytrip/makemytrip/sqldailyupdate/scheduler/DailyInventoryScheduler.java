package com.makemytrip.makemytrip.sqldailyupdate.scheduler;

import com.makemytrip.makemytrip.sqldailyupdate.config.InventoryUpdateProperties;
import com.makemytrip.makemytrip.sqldailyupdate.service.DailyInventoryUpdateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyInventoryScheduler {

    private static final Logger log = LoggerFactory.getLogger(DailyInventoryScheduler.class);

    private final DailyInventoryUpdateService dailyInventoryUpdateService;
    private final InventoryUpdateProperties properties;

    public DailyInventoryScheduler(
        DailyInventoryUpdateService dailyInventoryUpdateService,
        InventoryUpdateProperties properties
    ) {
        this.dailyInventoryUpdateService = dailyInventoryUpdateService;
        this.properties = properties;
    }

    @Scheduled(
        cron = "${app.inventory.refresh.cron:0 0 0 * * *}",
        zone = "${app.inventory.refresh.timezone:Asia/Kolkata}"
    )
    public void scheduleDailyRefresh() {
        if (!properties.isEnabled()) {
            log.info("Scheduled daily inventory refresh skipped: app.inventory.refresh.enabled is false.");
            return;
        }

        log.info("Triggering scheduled daily inventory refresh...");
        dailyInventoryUpdateService.runRefresh("SCHEDULED");
    }
}

