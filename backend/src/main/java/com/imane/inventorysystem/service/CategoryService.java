package com.imane.inventorysystem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.imane.inventorysystem.entity.Category;
import com.imane.inventorysystem.repository.CategoryRepository;

@Service
public class CategoryService {
    @Autowired private CategoryRepository repo;
    
    public List<Category> getAllCategories() {
        return repo.findAll();
    }
    
    public Category saveCategory(Category category) {
        return repo.save(category);
    }

    public void deleteCategory(Long id) {
        repo.deleteById(id);
    }
}