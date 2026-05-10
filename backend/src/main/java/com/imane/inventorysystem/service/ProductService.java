package com.imane.inventorysystem.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    private final String uploadPath = "uploads/products/";

    public Page<Product> getAllProducts(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return repo.findAll(pageable);
        }
        return repo.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrBrandContainingIgnoreCaseOrColorContainingIgnoreCase(
            search, search, search, search, pageable
        );
    }

    public Product saveProduct(Product product) {
        if (product.getSku() == null || product.getSku().isEmpty()) {
            throw new RuntimeException("SKU is required");
        }
        if (product.getName() == null || product.getName().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (product.getQuantity() == null || product.getQuantity() < 0) {
            throw new RuntimeException("Quantity is required");
        }
        if (product.getCategoryId() == null) {
            throw new RuntimeException("Category ID is required");
        }
        if (product.getMinStockLevel() == null || product.getMinStockLevel() < 0) {
            throw new RuntimeException("Min Stock Level is required");
        }
        if (product.getPurchasePrice() == null || product.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Purchase Price must be greater than 0");
        }
        if (product.getSellPrice() == null || product.getSellPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Sell Price must be greater than 0");
        }
        return repo.save(product);
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    public Product findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Product> products = repo.findAll();

        stats.put("totalProducts", products.size());

        long totalStock = products.stream().mapToInt(Product::getQuantity).sum();
        stats.put("totalStock", totalStock);

        BigDecimal inventoryValue = products.stream()
                .map(p -> p.getPurchasePrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("inventoryValue", inventoryValue);

        BigDecimal expectedProfit = products.stream()
                .map(p -> p.getSellPrice().subtract(p.getPurchasePrice())
                        .multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("expectedProfit", expectedProfit);

        stats.put("lowStockCount", products.stream()
                .filter(p -> p.getQuantity() <= p.getMinStockLevel())
                .count());

        return stats;
    }
}