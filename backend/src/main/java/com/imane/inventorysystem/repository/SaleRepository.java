package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByTransactionId(String transactionId);

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.status = 'COMPLETED'")
    Double getTotalRevenue();
}