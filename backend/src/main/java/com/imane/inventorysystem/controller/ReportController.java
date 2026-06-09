package com.imane.inventorysystem.controller;

import com.imane.inventorysystem.dto.DashboardAnalyticsResponse;
import com.imane.inventorysystem.entity.Report;
import com.imane.inventorysystem.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Legacy/retrocompatibility endpoint for dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<DashboardAnalyticsResponse> getStats() {
        return ResponseEntity.ok(reportService.getSummaryStatistics());
    }

    // New REST API endpoints for the Finexa reports section
    @GetMapping
    public ResponseEntity<List<Report>> getReports(@RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(reportService.getAllReports(search));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(reportService.getReportsSummary());
    }

    @PostMapping("/generate")
    public ResponseEntity<Report> generateReport(
            @RequestParam(value = "type", required = false) String type,
            @RequestBody(required = false) Map<String, String> body) {
        
        String reportType = type;
        if (reportType == null && body != null) {
            reportType = body.get("type");
        }
        if (reportType == null) {
            reportType = "Income";
        }
        return ResponseEntity.ok(reportService.generateNewReport(reportType));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable("id") Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}