package com.imane.inventorysystem.controller;

import com.imane.inventorysystem.dto.SaleRequest;
import com.imane.inventorysystem.dto.SaleResponse;
import com.imane.inventorysystem.service.SaleService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    // GET sales with pagination and filters
    @GetMapping
    public ResponseEntity<Page<SaleResponse>> getAllSales(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable) {
        return ResponseEntity.ok(saleService.getAllSales(search, status, start, end, pageable));
    }

    // Process Sale
    @PostMapping("/process")
    public ResponseEntity<SaleResponse> createSale(@RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.processSale(request));
    }

    @GetMapping("/stats/revenue")
    public ResponseEntity<BigDecimal> getRevenue() {
        return ResponseEntity.ok(saleService.getTotalRevenue());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.ok().build();
    }
}