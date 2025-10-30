package com.ecommerce.product.service;

import com.ecommerce.product.dto.CategoryResponse;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderByName()
                .stream()
                .map(CategoryResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNullAndIsActiveTrueOrderByName()
                .stream()
                .map(CategoryResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<CategoryResponse> getSubcategories(Long parentId) {
        return categoryRepository.findByParentIdAndIsActiveTrueOrderByName(parentId)
                .stream()
                .map(CategoryResponse::new)
                .collect(Collectors.toList());
    }
    
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return new CategoryResponse(category);
    }
    
    public List<CategoryResponse> getCategoryHierarchy(Long categoryId) {
        return categoryRepository.findCategoryHierarchy(categoryId)
                .stream()
                .map(CategoryResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<Long> getCategoryHierarchyIds(Long categoryId) {
        return categoryRepository.findCategoryHierarchyIds(categoryId);
    }
    
    public List<CategoryResponse> getCategoriesWithProducts() {
        return categoryRepository.findCategoriesWithProducts()
                .stream()
                .map(CategoryResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<CategoryResponse> searchCategories(String name) {
        return categoryRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name)
                .stream()
                .map(CategoryResponse::new)
                .collect(Collectors.toList());
    }
}