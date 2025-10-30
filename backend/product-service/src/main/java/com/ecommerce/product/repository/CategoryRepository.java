package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find active categories
    List<Category> findByIsActiveTrueOrderByName();
    
    // Find root categories (no parent)
    List<Category> findByParentIsNullAndIsActiveTrueOrderByName();
    
    // Find subcategories by parent
    List<Category> findByParentIdAndIsActiveTrueOrderByName(Long parentId);
    
    // Find category by name
    List<Category> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    // Get category hierarchy (all descendants)
    @Query("SELECT c FROM Category c WHERE " +
           "c.id = :categoryId " +
           "OR c.parent.id = :categoryId " +
           "OR c.parent.parent.id = :categoryId " +
           "AND c.isActive = true " +
           "ORDER BY c.name")
    List<Category> findCategoryHierarchy(@Param("categoryId") Long categoryId);
    
    // Get all category IDs in hierarchy
    @Query("SELECT c.id FROM Category c WHERE " +
           "c.id = :categoryId " +
           "OR c.parent.id = :categoryId " +
           "OR c.parent.parent.id = :categoryId " +
           "AND c.isActive = true")
    List<Long> findCategoryHierarchyIds(@Param("categoryId") Long categoryId);
    
    // Find categories with products
    @Query("SELECT DISTINCT c FROM Category c " +
           "JOIN c.products p " +
           "WHERE c.isActive = true " +
           "AND p.isActive = true " +
           "ORDER BY c.name")
    List<Category> findCategoriesWithProducts();
}