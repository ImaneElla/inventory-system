package com.imane.inventorysystem.controller;

import com.imane.inventorysystem.dto.SaleRequest;
import com.imane.inventorysystem.entity.Sale;
import com.imane.inventorysystem.service.SaleService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;

    // GET all sales
    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // Process Sale
    @PostMapping("/process")
    public ResponseEntity<?> createSale(@RequestBody SaleRequest request) {

        try {
            Sale processedSale = saleService.processSale(request);

            return ResponseEntity.ok(processedSale);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // Total Revenue
    @GetMapping("/stats/revenue")
    public ResponseEntity<Double> getRevenue() {

        return ResponseEntity.ok(
                saleService.getTotalRevenue()
        );
    }
}