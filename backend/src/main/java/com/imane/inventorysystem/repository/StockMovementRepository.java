package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Modifying
    @Transactional
    @Query("DELETE FROM StockMovement sm WHERE sm.product.id = :productId")
    void deleteByProductId(Long productId);
}
