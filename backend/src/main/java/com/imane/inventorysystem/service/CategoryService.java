package com.imane.inventorysystem.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.imane.inventorysystem.dto.CategoryRequest;
import com.imane.inventorysystem.dto.CategoryResponse;
import com.imane.inventorysystem.entity.Category;
import com.imane.inventorysystem.repository.CategoryRepository;

@Service
public class CategoryService {
    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }
    
    public List<CategoryResponse> getAllCategories() {
        return repo.findAll().stream()
                .map(this::mapToResponse)
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
        return mapToResponse(saved);
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
        return mapToResponse(updated);
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
        return mapToResponse(repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id)));
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
}