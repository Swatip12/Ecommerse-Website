package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find by SKU
    Optional<Product> findBySku(String sku);
    
    // Find active products
    Page<Product> findByIsActiveTrue(Pageable pageable);
    
    // Find by category
    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    
    // Find by category including subcategories
    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds AND p.isActive = true")
    Page<Product> findByCategoryIdsAndIsActiveTrue(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);
    
    // Find by brand
    Page<Product> findByBrandAndIsActiveTrue(String brand, Pageable pageable);
    
    // Find by price range
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice AND p.isActive = true")
    Page<Product> findByPriceRangeAndIsActiveTrue(@Param("minPrice") BigDecimal minPrice, 
                                                  @Param("maxPrice") BigDecimal maxPrice, 
                                                  Pageable pageable);
    
    // Full-text search with relevance scoring
    @Query("SELECT p, " +
           "CASE " +
           "  WHEN MATCH(p.name, p.description) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE) > 0 " +
           "    THEN MATCH(p.name, p.description) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE) " +
           "  WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "    THEN 0.8 " +
           "  WHEN LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "    THEN 0.5 " +
           "  ELSE 0.1 " +
           "END as relevance " +
           "FROM Product p WHERE " +
           "(MATCH(p.name, p.description) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE) " +
           "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND p.isActive = true " +
           "ORDER BY relevance DESC")
    Page<Object[]> findBySearchTermWithRelevance(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Simple full-text search (for backward compatibility)
    @Query("SELECT p FROM Product p WHERE " +
           "(MATCH(p.name, p.description) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE) " +
           "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND p.isActive = true")
    Page<Product> findBySearchTermAndIsActiveTrue(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Complex search with filters
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN p.inventory inv " +
           "WHERE (:searchTerm IS NULL OR " +
           "       MATCH(p.name, p.description) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE) OR " +
           "       LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "       LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND (:categoryIds IS NULL OR p.category.id IN :categoryIds) " +
           "AND (:brands IS NULL OR p.brand IN :brands) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:inStockOnly = false OR (inv.quantityAvailable > 0)) " +
           "AND p.isActive = true")
    Page<Product> findWithFilters(@Param("searchTerm") String searchTerm,
                                  @Param("categoryIds") List<Long> categoryIds,
                                  @Param("brands") List<String> brands,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  @Param("inStockOnly") Boolean inStockOnly,
                                  Pageable pageable);
    
    // Find products with low stock
    @Query("SELECT p FROM Product p " +
           "JOIN p.inventory inv " +
           "WHERE inv.quantityAvailable <= inv.reorderLevel " +
           "AND p.isActive = true")
    List<Product> findLowStockProducts();
    
    // Find products by category hierarchy (including parent categories)
    @Query("SELECT p FROM Product p " +
           "WHERE p.category.id = :categoryId " +
           "OR p.category.parent.id = :categoryId " +
           "OR p.category.parent.parent.id = :categoryId " +
           "AND p.isActive = true")
    Page<Product> findByCategoryHierarchy(@Param("categoryId") Long categoryId, Pageable pageable);
    
    // Get distinct brands
    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL AND p.isActive = true ORDER BY p.brand")
    List<String> findDistinctBrands();
    
    // Get price range
    @Query("SELECT MIN(p.price), MAX(p.price) FROM Product p WHERE p.isActive = true")
    Object[] findPriceRange();
    
    // Count products by category
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    Long countByCategoryId(@Param("categoryId") Long categoryId);
    
    // Find featured products (can be extended with a featured flag)
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN p.inventory inv " +
           "WHERE p.isActive = true " +
           "AND inv.quantityAvailable > 0 " +
           "ORDER BY p.createdAt DESC")
    Page<Product> findFeaturedProducts(Pageable pageable);
    
    // Admin search methods (including inactive products)
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN p.inventory inv " +
           "WHERE (:searchTerm IS NULL OR " +
           "       MATCH(p.name, p.description) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE) OR " +
           "       LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "       LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND (:categoryIds IS NULL OR p.category.id IN :categoryIds) " +
           "AND (:brands IS NULL OR p.brand IN :brands) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:inStockOnly = false OR (inv.quantityAvailable > 0))")
    Page<Product> findWithFiltersIncludingInactive(@Param("searchTerm") String searchTerm,
                                                   @Param("categoryIds") List<Long> categoryIds,
                                                   @Param("brands") List<String> brands,
                                                   @Param("minPrice") BigDecimal minPrice,
                                                   @Param("maxPrice") BigDecimal maxPrice,
                                                   @Param("inStockOnly") Boolean inStockOnly,
                                                   Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(MATCH(p.name, p.description) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE) " +
           "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Product> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    
    // Bulk operations support methods
    List<Product> findByCategoryIdInAndIsActive(List<Long> categoryIds, Boolean isActive);
    
    List<Product> findByCategoryIdIn(List<Long> categoryIds);
    
    List<Product> findByIsActive(Boolean isActive);
    
    // Search suggestions and autocomplete
    @Query("SELECT DISTINCT p.name FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT(:searchTerm, '%')) " +
           "AND p.isActive = true " +
           "ORDER BY p.name " +
           "LIMIT 10")
    List<String> findProductNameSuggestions(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT DISTINCT p.brand FROM Product p WHERE " +
           "LOWER(p.brand) LIKE LOWER(CONCAT(:searchTerm, '%')) " +
           "AND p.brand IS NOT NULL " +
           "AND p.isActive = true " +
           "ORDER BY p.brand " +
           "LIMIT 5")
    List<String> findBrandSuggestions(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT DISTINCT c.name FROM Category c " +
           "JOIN Product p ON p.category.id = c.id " +
           "WHERE LOWER(c.name) LIKE LOWER(CONCAT(:searchTerm, '%')) " +
           "AND c.isActive = true " +
           "AND p.isActive = true " +
           "ORDER BY c.name " +
           "LIMIT 5")
    List<String> findCategorySuggestions(@Param("searchTerm") String searchTerm);
    
    // Popular search terms (based on product names and categories)
    @Query("SELECT p.name, COUNT(*) as frequency FROM Product p " +
           "WHERE p.isActive = true " +
           "GROUP BY p.name " +
           "ORDER BY frequency DESC " +
           "LIMIT 10")
    List<Object[]> findPopularProductNames();
    
    // Analytics methods
    Long countByIsActive(Boolean isActive);
    
    @Query("SELECT SUM(p.price * inv.quantityAvailable) FROM Product p " +
           "JOIN p.inventory inv " +
           "WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryValue();
    
    @Query("SELECT c.name, COUNT(p), SUM(p.price * inv.quantityAvailable) " +
           "FROM Product p " +
           "JOIN p.category c " +
           "JOIN p.inventory inv " +
           "WHERE p.isActive = true " +
           "GROUP BY c.id, c.name")
    List<Object[]> countProductsByCategory();
}