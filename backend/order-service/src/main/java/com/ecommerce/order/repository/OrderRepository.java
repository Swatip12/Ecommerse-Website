package com.ecommerce.order.repository;

import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find order by order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * Find all orders for a specific user
     */
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find orders by user ID and status
     */
    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status, Pageable pageable);
    
    /**
     * Find orders by status
     */
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);
    
    /**
     * Find orders created within date range
     */
    Page<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * Find orders by user ID within date range
     */
    Page<Order> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * Count orders by status
     */
    long countByStatus(OrderStatus status);
    
    /**
     * Count orders by user ID
     */
    long countByUserId(Long userId);
    
    /**
     * Find orders that can be cancelled (PENDING or CONFIRMED status)
     */
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status IN ('PENDING', 'CONFIRMED') ORDER BY o.createdAt DESC")
    List<Order> findCancellableOrdersByUserId(@Param("userId") Long userId);
    
    /**
     * Find orders that can be refunded (DELIVERED status and PAID payment status)
     */
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status = 'DELIVERED' AND o.paymentStatus = 'PAID' ORDER BY o.createdAt DESC")
    List<Order> findRefundableOrdersByUserId(@Param("userId") Long userId);
    
    /**
     * Find recent orders for a user (last 30 days)
     */
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.createdAt >= :thirtyDaysAgo ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByUserId(@Param("userId") Long userId, @Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    /**
     * Check if order number exists
     */
    boolean existsByOrderNumber(String orderNumber);
    
    /**
     * Find orders with specific statuses for admin management
     */
    @Query("SELECT o FROM Order o WHERE o.status IN :statuses ORDER BY o.createdAt DESC")
    Page<Order> findByStatusIn(@Param("statuses") List<OrderStatus> statuses, Pageable pageable);
    
    /**
     * Find orders requiring attention (pending payment or processing)
     */
    @Query("SELECT o FROM Order o WHERE o.status IN ('PENDING', 'CONFIRMED') OR (o.status = 'PROCESSING' AND o.updatedAt < :cutoffTime) ORDER BY o.createdAt ASC")
    List<Order> findOrdersRequiringAttention(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find orders with filters for admin management
     */
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:orderNumber IS NULL OR o.orderNumber LIKE %:orderNumber%) AND " +
           "(:userId IS NULL OR o.userId = :userId) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findOrdersWithFilters(@Param("status") OrderStatus status,
                                     @Param("orderNumber") String orderNumber,
                                     @Param("userId") Long userId,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate,
                                     Pageable pageable);
    
    /**
     * Count orders in date range
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    long countOrdersInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Count orders by status in date range
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    long countOrdersByStatusInDateRange(@Param("status") OrderStatus status, 
                                       @Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get total revenue in date range
     */
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN ('DELIVERED', 'SHIPPED') AND o.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal getTotalRevenueInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}