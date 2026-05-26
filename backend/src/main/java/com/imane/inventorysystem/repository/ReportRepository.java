package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r FROM Report r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.summary) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY r.createdAt DESC")
    List<Report> searchReports(@Param("search") String search);
}
