package com.imane.inventorysystem.service;

import com.imane.inventorysystem.entity.MovementType;
import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.entity.StockMovement;
import com.imane.inventorysystem.repository.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockMovementService {

    private final StockMovementRepository repository;

    public StockMovementService(StockMovementRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public StockMovement record(Product product, int quantity, MovementType type, String reason) {
        if (product == null) {
            throw new IllegalArgumentException("Product must not be null");
        }
        if (reason == null || reason.isBlank()) {
            reason = type.name();
        }

        StockMovement movement = StockMovement.builder()
                .product(product)
                .type(type)
                .quantity(quantity)
                .reason(reason)
                .build();

        return repository.save(movement);
    }
}
