package com.ecommerce.product.repository;

import com.ecommerce.product.entity.ProductInventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductInventoryRepository extends JpaRepository<ProductInventory, Long> {
    
    /**
     * Find inventory by product ID
     */
    Optional<ProductInventory> findByProductId(Long productId);
    
    /**
     * Find all products with low stock (quantity <= reorder level)
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityAvailable <= pi.reorderLevel AND pi.product.isActive = true")
    List<ProductInventory> findLowStockProducts();
    
    /**
     * Find all products with low stock with pagination
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityAvailable <= pi.reorderLevel AND pi.product.isActive = true")
    Page<ProductInventory> findLowStockProducts(Pageable pageable);
    
    /**
     * Find all out of stock products
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityAvailable = 0 AND pi.product.isActive = true")
    List<ProductInventory> findOutOfStockProducts();
    
    /**
     * Find all out of stock products with pagination
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityAvailable = 0 AND pi.product.isActive = true")
    Page<ProductInventory> findOutOfStockProducts(Pageable pageable);
    
    /**
     * Find products with available quantity greater than specified amount
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityAvailable > :quantity AND pi.product.isActive = true")
    List<ProductInventory> findProductsWithQuantityGreaterThan(@Param("quantity") Integer quantity);
    
    /**
     * Find products by category with low stock
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityAvailable <= pi.reorderLevel AND pi.product.category.id = :categoryId AND pi.product.isActive = true")
    List<ProductInventory> findLowStockProductsByCategory(@Param("categoryId") Long categoryId);
    
    /**
     * Count products with low stock
     */
    @Query("SELECT COUNT(pi) FROM ProductInventory pi WHERE pi.quantityAvailable <= pi.reorderLevel AND pi.product.isActive = true")
    Long countLowStockProducts();
    
    /**
     * Count out of stock products
     */
    @Query("SELECT COUNT(pi) FROM ProductInventory pi WHERE pi.quantityAvailable = 0 AND pi.product.isActive = true")
    Long countOutOfStockProducts();
    
    /**
     * Find products that need reordering (quantity <= reorder level) by brand
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityAvailable <= pi.reorderLevel AND pi.product.brand = :brand AND pi.product.isActive = true")
    List<ProductInventory> findLowStockProductsByBrand(@Param("brand") String brand);
    
    /**
     * Check if product has sufficient quantity available
     */
    @Query("SELECT CASE WHEN pi.quantityAvailable >= :quantity THEN true ELSE false END FROM ProductInventory pi WHERE pi.productId = :productId")
    Boolean hasAvailableQuantity(@Param("productId") Long productId, @Param("quantity") Integer quantity);
    
    /**
     * Get total inventory value (sum of available quantity * product price)
     */
    @Query("SELECT SUM(pi.quantityAvailable * p.price) FROM ProductInventory pi JOIN pi.product p WHERE p.isActive = true")
    Double getTotalInventoryValue();
    
    /**
     * Find products with reserved quantity
     */
    @Query("SELECT pi FROM ProductInventory pi WHERE pi.quantityReserved > 0 AND pi.product.isActive = true")
    List<ProductInventory> findProductsWithReservedQuantity();
}