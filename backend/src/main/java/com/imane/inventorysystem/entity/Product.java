package com.imane.inventorysystem.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;  
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Product {

    public static long getQuantity(T value) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(unique = true,nullable = false)
private String sku;

@Column(nullable = false)
private String name;

private String description;
 
@Column(nullable = false)
private Integer quantity;

@Column(nullable = false)
private Integer categoryId; 


private String brand ;
private String color ;

@Column(updatable = false)
private LocalDateTime createdAt;
private LocalDateTime updatedAt;

@Column(nullable = false)
private Integer minStockLevel;

@Column(nullable = false,precision= 10,scale = 2)
private BigDecimal purchasePrice;

@Column(nullable = false,precision= 10,scale = 2)
private BigDecimal sellPrice;


private String imageUrl;


@Builder.Default
private Boolean isActive = true;


@PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
