package com.ecommerce.order.repository;

import com.ecommerce.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * Find all order items for a specific order
     */
    List<OrderItem> findByOrderIdOrderByCreatedAt(Long orderId);
    
    /**
     * Find order items by product ID
     */
    List<OrderItem> findByProductId(Long productId);
    
    /**
     * Find order items by product SKU
     */
    List<OrderItem> findByProductSku(String productSku);
    
    /**
     * Get total quantity sold for a product
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.productId = :productId")
    Long getTotalQuantitySoldForProduct(@Param("productId") Long productId);
    
    /**
     * Get order items for multiple orders
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id IN :orderIds ORDER BY oi.order.id, oi.createdAt")
    List<OrderItem> findByOrderIdIn(@Param("orderIds") List<Long> orderIds);
}