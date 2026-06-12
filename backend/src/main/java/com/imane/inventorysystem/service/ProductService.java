package com.imane.inventorysystem.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.imane.inventorysystem.dto.ProductRequest;
import com.imane.inventorysystem.dto.ProductResponse;
import com.imane.inventorysystem.entity.MovementType;
import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.repository.ProductRepository;
import com.imane.inventorysystem.repository.SaleItemRepository;
import com.imane.inventorysystem.repository.StockMovementRepository;
import com.imane.inventorysystem.service.StockMovementService;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final CategoryService categoryService;
    private final StockMovementService stockMovementService;
    private final SaleItemRepository saleItemRepository;
    private final StockMovementRepository stockMovementRepository;

    public ProductService(ProductRepository repo, CategoryService categoryService, StockMovementService stockMovementService,
                          SaleItemRepository saleItemRepository, StockMovementRepository stockMovementRepository) {
        this.repo = repo;
        this.categoryService = categoryService;
        this.stockMovementService = stockMovementService;
        this.saleItemRepository = saleItemRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    public Page<ProductResponse> getAllProducts(String search, Boolean isActive, String stockStatus, Long categoryId, String brand, Pageable pageable) {
        String safeSearch = search == null ? "" : search;
        String safeBrand = brand == null ? "" : brand;
        String safeStockStatus = stockStatus == null ? "" : stockStatus;
        Long safeCategoryId = categoryId == null ? -1L : categoryId;
        
        Page<Product> products = repo.findWithFilters(safeSearch, isActive, safeCategoryId, safeBrand, safeStockStatus, pageable);
        return products.map(this::mapToResponse);
    }

    public ProductResponse saveProduct(ProductRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Product request must not be null");
        }
        Product product = new Product();
        mapToEntity(request, product);
        validateProduct(product);
        sanitizeProduct(product);
        Product saved = repo.save(product);
        if (saved.getQuantity() != null && saved.getQuantity() > 0) {
            stockMovementService.record(saved, saved.getQuantity(), MovementType.RESTOCK,
                    "Initial stock for new product");
        }
        return mapToResponse(saved);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Product ID must not be null");
        }
        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        int oldQuantity = product.getQuantity() != null ? product.getQuantity() : 0;
        mapToEntity(request, product);
        validateProduct(product);
        sanitizeProduct(product);
        Product saved = repo.save(product);

        int newQuantity = saved.getQuantity() != null ? saved.getQuantity() : 0;
        int delta = newQuantity - oldQuantity;
        if (delta != 0) {
            MovementType movementType = delta > 0 ? MovementType.RESTOCK : MovementType.SALE;
            stockMovementService.record(saved, delta, movementType,
                    "Manual inventory adjustment");
        }

        return mapToResponse(saved);
    }

    private void validateProduct(Product product) {
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            throw new RuntimeException("SKU is required");
        }
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (product.getCategoryId() == null || product.getCategoryId() <= 0) {
            throw new RuntimeException("Category is required");
        }

        try {
            categoryService.findById(product.getCategoryId());
        } catch (RuntimeException e) {
            throw new RuntimeException("Selected category does not exist");
        }

        repo.findBySku(product.getSku()).ifPresent(existing -> {
            if (product.getId() == null || !existing.getId().equals(product.getId())) {
                throw new RuntimeException("SKU already exists: " + product.getSku());
            }
        });
    }

    private void sanitizeProduct(Product product) {
        if (product.getQuantity() == null || product.getQuantity() < 0) product.setQuantity(0);
        if (product.getMinStockLevel() == null || product.getMinStockLevel() < 0) product.setMinStockLevel(0);
        if (product.getPurchasePrice() == null) product.setPurchasePrice(BigDecimal.ZERO);
        if (product.getSellPrice() == null) product.setSellPrice(BigDecimal.ZERO);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Product ID must not be null");
        }
        if (!repo.existsById(id)) throw new IllegalArgumentException("Product not found with ID: " + id);
        
        // 1. Nullify references in sale items
        saleItemRepository.nullifyProductId(id);
        
        // 2. Delete stock movements
        stockMovementRepository.deleteByProductId(id);
        
        // 3. Delete the product itself
        repo.deleteById(id);
    }

    @Transactional
    public void deleteProducts(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        for (Long id : ids) {
            deleteProduct(id);
        }
    }

    public ProductResponse findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Product ID must not be null");
        }
        return mapToResponse(repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id)));
    }

    public ProductResponse toggleActive(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        product.setIsActive(product.getIsActive() == null || !product.getIsActive());
        return mapToResponse(repo.save(product));
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Product> products = repo.findAll();

        stats.put("totalProducts", products.size());

        long totalStock = products.stream()
                .mapToInt(p -> p.getQuantity() != null ? p.getQuantity() : 0)
                .sum();
        stats.put("totalStock", totalStock);

        BigDecimal inventoryValue = products.stream()
                .map(p -> {
                    BigDecimal price = p.getPurchasePrice() != null ? p.getPurchasePrice() : BigDecimal.ZERO;
                    int qty = p.getQuantity() != null ? p.getQuantity() : 0;
                    return price.multiply(BigDecimal.valueOf(qty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("inventoryValue", inventoryValue);

        BigDecimal expectedProfit = products.stream()
                .map(p -> {
                    BigDecimal sell = p.getSellPrice() != null ? p.getSellPrice() : BigDecimal.ZERO;
                    BigDecimal buy = p.getPurchasePrice() != null ? p.getPurchasePrice() : BigDecimal.ZERO;
                    int qty = p.getQuantity() != null ? p.getQuantity() : 0;
                    return sell.subtract(buy).multiply(BigDecimal.valueOf(qty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("expectedProfit", expectedProfit);

        stats.put("lowStockCount", products.stream()
                .filter(p -> {
                    int qty = p.getQuantity() != null ? p.getQuantity() : 0;
                    int min = p.getMinStockLevel() != null ? p.getMinStockLevel() : 0;
                    return qty <= min;
                })
                .count());
                
        long deactivatedCount = products.stream()
                .filter(p -> p.getIsActive() != null && !p.getIsActive())
                .count();
        stats.put("deactivatedCount", deactivatedCount);

        long outOfStockCount = products.stream()
                .filter(p -> {
                    int qty = p.getQuantity() != null ? p.getQuantity() : 0;
                    return qty <= 0;
                })
                .count();
        stats.put("outOfStockCount", outOfStockCount);

        long availableCount = products.stream()
                .filter(p -> (p.getIsActive() == null || p.getIsActive()) && (p.getQuantity() != null && p.getQuantity() > 0))
                .count();
        stats.put("availableCount", availableCount);

        return stats;
    }

    private void mapToEntity(ProductRequest req, Product entity) {
        entity.setSku(req.getSku());
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setQuantity(req.getQuantity());
        entity.setCategoryId(req.getCategoryId());
        entity.setBrand(req.getBrand());
        entity.setColor(req.getColor());
        entity.setMinStockLevel(req.getMinStockLevel());
        entity.setPurchasePrice(req.getPurchasePrice());
        entity.setSellPrice(req.getSellPrice());
        entity.setImageUrl(req.getImageUrl());
        if (req.getIsActive() != null) {
            entity.setIsActive(req.getIsActive());
        }
    }

    private ProductResponse mapToResponse(Product entity) {
        ProductResponse res = new ProductResponse();
        res.setId(entity.getId());
        res.setSku(entity.getSku());
        res.setName(entity.getName());
        res.setDescription(entity.getDescription());
        res.setQuantity(entity.getQuantity());
        res.setCategoryId(entity.getCategoryId());
        res.setBrand(entity.getBrand());
        res.setColor(entity.getColor());
        res.setMinStockLevel(entity.getMinStockLevel());
        res.setPurchasePrice(entity.getPurchasePrice());
        res.setSellPrice(entity.getSellPrice());
        res.setImageUrl(entity.getImageUrl());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        res.setIsActive(entity.getIsActive() == null ? true : entity.getIsActive());
        return res;
    }
}
