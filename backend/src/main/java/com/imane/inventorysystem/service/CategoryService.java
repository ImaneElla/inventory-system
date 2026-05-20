package com.imane.inventorysystem.service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.imane.inventorysystem.dto.CategoryRequest;
import com.imane.inventorysystem.dto.CategoryResponse;
import com.imane.inventorysystem.entity.Category;
import com.imane.inventorysystem.repository.CategoryRepository;
import com.imane.inventorysystem.repository.ProductRepository;

@Service
public class CategoryService {
    private final CategoryRepository repo;
    private final ProductRepository productRepo;

    public CategoryService(CategoryRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }
    
    public List<CategoryResponse> getAllCategories() {
        List<Object[]> stats = productRepo.getCategoryStats();
        Map<Long, Long[]> statsMap = new HashMap<>();
        for (Object[] row : stats) {
            if (row[0] != null) {
                Long catId = ((Number) row[0]).longValue();
                Long count = ((Number) row[1]).longValue();
                Long stock = ((Number) row[2]).longValue();
                statsMap.put(catId, new Long[]{count, stock});
            }
        }

        return repo.findAll().stream()
                .map(cat -> mapToResponseWithStats(cat, statsMap))
                .collect(Collectors.toList());
    }
    
    public CategoryResponse saveCategory(CategoryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Category request must not be null");
        }
        Category category = new Category();
        mapToEntity(request, category);
        validateCategory(category);
        Category saved = repo.save(category);
        if (saved == null) {
            throw new RuntimeException("Failed to save category");
        }
        return mapToResponseWithStats(saved, getStatsMapForSingle(saved.getId()));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID must not be null");
        }
        Category category = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        mapToEntity(request, category);
        validateCategory(category);
        Category updated = repo.save(category);
        if (updated == null) {
            throw new RuntimeException("Failed to update category");
        }
        return mapToResponseWithStats(updated, getStatsMapForSingle(updated.getId()));
    }

    private void validateCategory(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new RuntimeException("Category name is required");
        }
    }

    public void deleteCategory(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        repo.deleteById(id);
    }

    public CategoryResponse findById(Long id) {
        Category cat = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return mapToResponseWithStats(cat, getStatsMapForSingle(id));
    }

    private void mapToEntity(CategoryRequest req, Category entity) {
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setIcon(req.getIcon());
    }

    private CategoryResponse mapToResponse(Category entity) {
        CategoryResponse res = new CategoryResponse();
        res.setId(entity.getId());
        res.setName(entity.getName());
        res.setDescription(entity.getDescription());
        res.setIcon(entity.getIcon());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    private CategoryResponse mapToResponseWithStats(Category entity, Map<Long, Long[]> statsMap) {
        CategoryResponse res = mapToResponse(entity);
        Long[] stats = statsMap.get(entity.getId());
        if (stats != null) {
            res.setProductCount(stats[0]);
            res.setStockCount(stats[1]);
        } else {
            res.setProductCount(0L);
            res.setStockCount(0L);
        }
        return res;
    }

    private Map<Long, Long[]> getStatsMapForSingle(Long id) {
        Map<Long, Long[]> statsMap = new HashMap<>();
        Long count = productRepo.countByCategoryId(id);
        Long stock = productRepo.sumQuantityByCategoryId(id);
        statsMap.put(id, new Long[]{count != null ? count : 0L, stock != null ? stock : 0L});
        return statsMap;
    }
}