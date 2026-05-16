package com.imane.inventorysystem.controller;

import com.imane.inventorysystem.dto.SaleRequest;
import com.imane.inventorysystem.dto.SaleResponse;
import com.imane.inventorysystem.service.SaleService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    // GET all sales
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // Process Sale
    @PostMapping("/process")
    public ResponseEntity<SaleResponse> createSale(@RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.processSale(request));
    }

    @GetMapping("/stats/revenue")
    public ResponseEntity<Double> getRevenue() {

        return ResponseEntity.ok(
                saleService.getTotalRevenue()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.ok().build();
    }
}