package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByTransactionId(String transactionId);

    @Query("SELECT s FROM Sale s WHERE " +
           "(:search IS NULL OR LOWER(s.transactionId) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:startDate IS NULL OR s.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR s.createdAt <= :endDate)")
    Page<Sale> findWithFilters(String search, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();
}