package com.imane.inventorysystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false)
    private String type; // e.g. "Income", "Expense", "Forecast", "Budget vs Actual"

    @Column(name = "date_range")
    private String dateRange;

    private String formats; // comma-separated e.g. "PDF,Excel"

    private String status; // "Ready", "Scheduled"

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "total_revenue", precision = 15, scale = 2)
    private java.math.BigDecimal totalRevenue;

    @Column(name = "total_transactions")
    private Integer totalTransactions;

    @Column(name = "line_items", columnDefinition = "TEXT")
    private String lineItemsJson;

    @Transient
    private Object lineItems;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    protected void convertLineItemsToJson() {
        if (this.lineItems != null) {
            try {
                this.lineItemsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(this.lineItems);
            } catch (Exception e) {
                this.lineItemsJson = "[]";
            }
        }
    }

    @PostLoad
    protected void convertJsonToLineItems() {
        if (this.lineItemsJson != null) {
            try {
                this.lineItems = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    this.lineItemsJson,
                    new com.fasterxml.jackson.core.type.TypeReference<Object>() {}
                );
            } catch (Exception e) {
                this.lineItems = new java.util.ArrayList<>();
            }
        }
    }

    // Getters and Setters manually added to ensure compilation with or without Lombok config details
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDateRange() { return dateRange; }
    public void setDateRange(String dateRange) { this.dateRange = dateRange; }
    public String getFormats() { return formats; }
    public void setFormats(String formats) { this.formats = formats; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public java.math.BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(java.math.BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public Integer getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(Integer totalTransactions) { this.totalTransactions = totalTransactions; }
    public String getLineItemsJson() { return lineItemsJson; }
    public void setLineItemsJson(String lineItemsJson) { this.lineItemsJson = lineItemsJson; }
    public Object getLineItems() { return lineItems; }
    public void setLineItems(Object lineItems) { this.lineItems = lineItems; }
}
