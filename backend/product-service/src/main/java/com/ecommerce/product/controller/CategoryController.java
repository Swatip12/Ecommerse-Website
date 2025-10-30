package com.ecommerce.product.controller;

import com.ecommerce.product.dto.CategoryResponse;
import com.ecommerce.product.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/root")
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        List<CategoryResponse> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        try {
            CategoryResponse category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<List<CategoryResponse>> getSubcategories(@PathVariable Long parentId) {
        List<CategoryResponse> subcategories = categoryService.getSubcategories(parentId);
        return ResponseEntity.ok(subcategories);
    }
    
    @GetMapping("/{categoryId}/hierarchy")
    public ResponseEntity<List<CategoryResponse>> getCategoryHierarchy(@PathVariable Long categoryId) {
        List<CategoryResponse> hierarchy = categoryService.getCategoryHierarchy(categoryId);
        return ResponseEntity.ok(hierarchy);
    }
    
    @GetMapping("/with-products")
    public ResponseEntity<List<CategoryResponse>> getCategoriesWithProducts() {
        List<CategoryResponse> categories = categoryService.getCategoriesWithProducts();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CategoryResponse>> searchCategories(@RequestParam String name) {
        List<CategoryResponse> categories = categoryService.searchCategories(name);
        return ResponseEntity.ok(categories);
    }
}