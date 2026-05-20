package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    @Query("SELECT p.id, p.name, p.imageUrl, SUM(si.quantity), SUM(si.price * si.quantity) " +
            "FROM SaleItem si JOIN si.product p JOIN si.sale s " +
            "WHERE s.status = 'COMPLETED' " +
            "GROUP BY p.id, p.name, p.imageUrl " +
            "ORDER BY SUM(si.quantity) DESC")
    List<Object[]> findTopSellingProducts(org.springframework.data.domain.Pageable pageable);
}
