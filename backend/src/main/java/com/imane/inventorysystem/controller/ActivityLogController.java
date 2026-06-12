package com.imane.inventorysystem.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.imane.inventorysystem.dto.ActivityLogRequest;
import com.imane.inventorysystem.dto.ActivityLogResponse;
import com.imane.inventorysystem.service.ActivityLogService;

@RestController
@RequestMapping("/api/v1/activity-logs")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityLogController {

    private final ActivityLogService service;

    public ActivityLogController(ActivityLogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLogResponse>> getAll(
            @RequestHeader(value = "X-Current-User-Id", required = false) Integer currentUserId
    ) {
        return ResponseEntity.ok(service.getAllLogs());
    }

    @PostMapping
    public ResponseEntity<ActivityLogResponse> addLog(
            @RequestBody ActivityLogRequest request,
            @RequestHeader(value = "X-Current-User-Id", required = false) Integer currentUserId
    ) {
        return ResponseEntity.ok(service.saveLog(request, currentUserId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearLogs(
            @RequestHeader(value = "X-Current-User-Id", required = false) Integer currentUserId
    ) {
        service.clearAllLogs();
        return ResponseEntity.ok().build();
    }
}
