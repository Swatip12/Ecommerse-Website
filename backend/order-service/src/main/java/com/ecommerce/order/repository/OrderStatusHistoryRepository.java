package com.ecommerce.order.repository;

import com.ecommerce.order.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
    
    /**
     * Find status history for a specific order
     */
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    
    /**
     * Find status history for multiple orders
     */
    @Query("SELECT osh FROM OrderStatusHistory osh WHERE osh.order.id IN :orderIds ORDER BY osh.order.id, osh.createdAt DESC")
    List<OrderStatusHistory> findByOrderIdInOrderByCreatedAtDesc(@Param("orderIds") List<Long> orderIds);
    
    /**
     * Find recent status changes
     */
    List<OrderStatusHistory> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);
    
    /**
     * Find status changes by a specific user
     */
    List<OrderStatusHistory> findByChangedByOrderByCreatedAtDesc(Long changedBy);
    
    /**
     * Find latest status change for an order
     */
    @Query("SELECT osh FROM OrderStatusHistory osh WHERE osh.order.id = :orderId ORDER BY osh.createdAt DESC LIMIT 1")
    OrderStatusHistory findLatestByOrderId(@Param("orderId") Long orderId);
}