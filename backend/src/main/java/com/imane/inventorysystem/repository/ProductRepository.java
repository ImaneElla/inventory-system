package com.imane.inventorysystem.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.imane.inventorysystem.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrBrandContainingIgnoreCaseOrColorContainingIgnoreCase(
        String name, String sku, String brand, String color, Pageable pageable
    );
    
    List<Product> findByQuantityLessThanEqual(Integer minStockLevel);
    
    List<Product> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}