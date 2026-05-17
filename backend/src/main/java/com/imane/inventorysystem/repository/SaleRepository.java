package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByTransactionId(String transactionId);

    @Query(value = "SELECT * FROM sales s WHERE " +
       "(:search IS NULL OR CAST(s.transaction_id AS varchar) LIKE CONCAT('%', :search, '%')) AND " +
       "(:status IS NULL OR s.status = :status) AND " +
       "(CAST(:startDate AS timestamp) IS NULL OR s.created_at >= CAST(:startDate AS timestamp)) AND " +
       "(CAST(:endDate AS timestamp) IS NULL OR s.created_at <= CAST(:endDate AS timestamp))",
       countQuery = "SELECT COUNT(*) FROM sales s WHERE " +
       "(:search IS NULL OR CAST(s.transaction_id AS varchar) LIKE CONCAT('%', :search, '%')) AND " +
       "(:status IS NULL OR s.status = :status) AND " +
       "(CAST(:startDate AS timestamp) IS NULL OR s.created_at >= CAST(:startDate AS timestamp)) AND " +
       "(CAST(:endDate AS timestamp) IS NULL OR s.created_at <= CAST(:endDate AS timestamp))",
       nativeQuery = true)
    Page<Sale> findWithFilters(
        @Param("search") String search,
        @Param("status") String status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();
}
