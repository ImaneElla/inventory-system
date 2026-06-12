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
       "(CAST(:endDate AS timestamp) IS NULL OR s.created_at <= CAST(:endDate AS timestamp)) " +
       "ORDER BY s.created_at DESC",
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

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = 'COMPLETED'")
    long countCompletedSales();

    @Query(value = "SELECT CAST(EXTRACT(DOW FROM s.created_at) AS int), COUNT(*) " +
            "FROM sales s WHERE s.status = 'COMPLETED' GROUP BY EXTRACT(DOW FROM s.created_at)",
            nativeQuery = true)
    java.util.List<Object[]> countSalesByDayOfWeek();

    @Query(value = "SELECT TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') AS month_label, " +
            "COALESCE(SUM(s.total_amount), 0) " +
            "FROM sales s WHERE s.status = 'COMPLETED' AND s.created_at >= :since " +
            "GROUP BY DATE_TRUNC('month', s.created_at), TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') " +
            "ORDER BY DATE_TRUNC('month', s.created_at)",
            nativeQuery = true)
    java.util.List<Object[]> revenueByMonth(@Param("since") LocalDateTime since);

    @Query(value = "SELECT COUNT(DISTINCT s.client_name) FROM sales s " +
            "WHERE s.status = 'COMPLETED' AND s.client_name IS NOT NULL AND TRIM(s.client_name) <> ''",
            nativeQuery = true)
    long countDistinctClients();

    @Query(value = "SELECT COUNT(*) FROM (" +
            "SELECT s.client_name FROM sales s " +
            "WHERE s.status = 'COMPLETED' AND s.client_name IS NOT NULL AND TRIM(s.client_name) <> '' " +
            "GROUP BY s.client_name HAVING COUNT(*) > 1" +
            ") repeat_clients", nativeQuery = true)
    long countRepeatClients();
}
