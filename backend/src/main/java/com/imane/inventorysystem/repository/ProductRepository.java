package com.imane.inventorysystem.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.imane.inventorysystem.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrBrandContainingIgnoreCaseOrColorContainingIgnoreCase(
            String name, String sku, String brand, String color, Pageable pageable);

    Optional<Product> findBySku(String sku);

    List<Product> findByQuantityLessThanEqual(Integer minStockLevel);

    List<Product> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT p.categoryId, COUNT(p), COALESCE(SUM(p.quantity), 0) FROM Product p GROUP BY p.categoryId")
    List<Object[]> getCategoryStats();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.categoryId = :categoryId")
    Long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Product p WHERE p.categoryId = :categoryId")
    Long sumQuantityByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive) AND " +
           "(:categoryId = -1 OR p.categoryId = :categoryId) AND " +
           "(:brand = '' OR p.brand = :brand) AND " +
           "(:stockStatus = '' OR " +
           "  (:stockStatus = 'IN_STOCK' AND p.quantity > p.minStockLevel) OR " +
           "  (:stockStatus = 'LOW_STOCK' AND p.quantity > 0 AND p.quantity <= p.minStockLevel) OR " +
           "  (:stockStatus = 'OUT_OF_STOCK' AND p.quantity <= 0))")
    Page<Product> findWithFilters(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            @Param("categoryId") Long categoryId,
            @Param("brand") String brand,
            @Param("stockStatus") String stockStatus,
            Pageable pageable);
}