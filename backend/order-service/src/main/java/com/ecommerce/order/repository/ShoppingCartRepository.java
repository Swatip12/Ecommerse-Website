package com.ecommerce.order.repository;

import com.ecommerce.order.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    
    // Find cart items for registered users
    List<ShoppingCart> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find cart items for guest users
    List<ShoppingCart> findBySessionIdOrderByCreatedAtDesc(String sessionId);
    
    // Find specific cart item for registered user
    Optional<ShoppingCart> findByUserIdAndProductId(Long userId, Long productId);
    
    // Find specific cart item for guest user
    Optional<ShoppingCart> findBySessionIdAndProductId(String sessionId, Long productId);
    
    // Count items in cart for registered user
    @Query("SELECT COUNT(c) FROM ShoppingCart c WHERE c.userId = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    // Count items in cart for guest user
    @Query("SELECT COUNT(c) FROM ShoppingCart c WHERE c.sessionId = :sessionId")
    long countBySessionId(@Param("sessionId") String sessionId);
    
    // Get total quantity for registered user
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM ShoppingCart c WHERE c.userId = :userId")
    int getTotalQuantityByUserId(@Param("userId") Long userId);
    
    // Get total quantity for guest user
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM ShoppingCart c WHERE c.sessionId = :sessionId")
    int getTotalQuantityBySessionId(@Param("sessionId") String sessionId);
    
    // Delete all cart items for registered user
    @Modifying
    @Query("DELETE FROM ShoppingCart c WHERE c.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    // Delete all cart items for guest user
    @Modifying
    @Query("DELETE FROM ShoppingCart c WHERE c.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
    
    // Delete specific cart item for registered user
    @Modifying
    @Query("DELETE FROM ShoppingCart c WHERE c.userId = :userId AND c.productId = :productId")
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // Delete specific cart item for guest user
    @Modifying
    @Query("DELETE FROM ShoppingCart c WHERE c.sessionId = :sessionId AND c.productId = :productId")
    void deleteBySessionIdAndProductId(@Param("sessionId") String sessionId, @Param("productId") Long productId);
    
    // Transfer guest cart to user cart when user logs in
    @Modifying
    @Query("UPDATE ShoppingCart c SET c.userId = :userId, c.sessionId = null WHERE c.sessionId = :sessionId")
    void transferGuestCartToUser(@Param("sessionId") String sessionId, @Param("userId") Long userId);
    
    // Find products that exist in both guest and user carts (for merge operations)
    @Query("SELECT c.productId FROM ShoppingCart c WHERE c.sessionId = :sessionId AND c.productId IN " +
           "(SELECT c2.productId FROM ShoppingCart c2 WHERE c2.userId = :userId)")
    List<Long> findConflictingProducts(@Param("sessionId") String sessionId, @Param("userId") Long userId);
    
    // Clean up old guest cart items (older than specified days)
    @Modifying
    @Query("DELETE FROM ShoppingCart c WHERE c.sessionId IS NOT NULL AND c.createdAt < :cutoffDate")
    void deleteOldGuestCartItems(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}