package com.makemytrip.makemytrip.sqldailyupdate;

import com.makemytrip.makemytrip.sqldailyupdate.controller.InventoryUpdateAdminController;
import com.makemytrip.makemytrip.sqldailyupdate.dto.InventoryUpdateSummaryDTO;
import com.makemytrip.makemytrip.sqldailyupdate.service.DailyInventoryUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryUpdateAdminControllerTest {

    @Mock
    private DailyInventoryUpdateService dailyInventoryUpdateService;

    private InventoryUpdateAdminController controller;

    @BeforeEach
    void setUp() {
        controller = new InventoryUpdateAdminController(dailyInventoryUpdateService);
    }

    @Test
    void testTriggerManualRefresh_Success() {
        InventoryUpdateSummaryDTO summary = new InventoryUpdateSummaryDTO();
        summary.setStatus("SUCCESS");
        summary.setMessage("Completed");
        when(dailyInventoryUpdateService.runRefresh("MANUAL")).thenReturn(summary);

        ResponseEntity<InventoryUpdateSummaryDTO> response = controller.triggerManualRefresh();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SUCCESS", response.getBody().getStatus());
    }

    @Test
    void testTriggerManualRefresh_ConflictWhenAlreadyRunning() {
        InventoryUpdateSummaryDTO busy = new InventoryUpdateSummaryDTO();
        busy.setStatus("ALREADY_RUNNING");
        when(dailyInventoryUpdateService.runRefresh("MANUAL")).thenReturn(busy);

        ResponseEntity<InventoryUpdateSummaryDTO> response = controller.triggerManualRefresh();

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("ALREADY_RUNNING", response.getBody().getStatus());
    }

    @Test
    void testGetRefreshStatus() {
        when(dailyInventoryUpdateService.isRunning()).thenReturn(false);
        when(dailyInventoryUpdateService.getLastExecutionTime()).thenReturn(LocalDateTime.of(2026, 11, 2, 0, 0));
        when(dailyInventoryUpdateService.getLastSummary()).thenReturn(new InventoryUpdateSummaryDTO());

        ResponseEntity<Map<String, Object>> response = controller.getRefreshStatus();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(false, body.get("running"));
        assertNotNull(body.get("lastExecutionTime"));
        assertNotNull(body.get("lastSummary"));
    }
}

