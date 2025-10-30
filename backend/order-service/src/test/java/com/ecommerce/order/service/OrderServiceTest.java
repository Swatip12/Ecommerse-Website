package com.ecommerce.order.service;

import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderDto;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.repository.OrderItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
    private CreateOrderRequest createOrderRequest;
    private List<OrderItem> testOrderItems;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setOrderNumber("ORD-001");
        testOrder.setUserId(1L);
        testOrder.setStatus(Order.OrderStatus.PENDING);
        testOrder.setSubtotal(new BigDecimal("99.99"));
        testOrder.setTaxAmount(new BigDecimal("8.00"));
        testOrder.setShippingAmount(new BigDecimal("5.99"));
        testOrder.setTotalAmount(new BigDecimal("113.98"));
        testOrder.setPaymentStatus(Order.PaymentStatus.PENDING);

        createOrderRequest = new CreateOrderRequest();
        createOrderRequest.setUserId(1L);
        createOrderRequest.setShippingAddressId(1L);
        createOrderRequest.setBillingAddressId(1L);

        OrderItem item1 = new OrderItem();
        item1.setId(1L);
        item1.setOrderId(1L);
        item1.setProductId(1L);
        item1.setProductSku("PROD-001");
        item1.setProductName("Test Product");
        item1.setQuantity(2);
        item1.setUnitPrice(new BigDecimal("49.99"));
        item1.setTotalPrice(new BigDecimal("99.98"));

        testOrderItems = Arrays.asList(item1);
    }

    @Test
    void testCreateOrder_Success() {
        // Given
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(orderItemRepository.saveAll(any())).thenReturn(testOrderItems);

        // When
        OrderDto result = orderService.createOrder(createOrderRequest);

        // Then
        assertNotNull(result);
        assertEquals("ORD-001", result.getOrderNumber());
        assertEquals(Order.OrderStatus.PENDING, result.getStatus());
        assertEquals(new BigDecimal("113.98"), result.getTotalAmount());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void testCreateOrder_InvalidRequest() {
        // Given
        createOrderRequest.setUserId(null);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> orderService.createOrder(createOrderRequest));
        assertEquals("User ID is required", exception.getMessage());
    }

    @Test
    void testGetOrderById_Success() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(testOrderItems);

        // When
        OrderDto result = orderService.getOrderById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("ORD-001", result.getOrderNumber());
        assertEquals(1, result.getItems().size());
    }

    @Test
    void testGetOrderById_NotFound() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> orderService.getOrderById(1L));
        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    void testGetOrderByOrderNumber_Success() {
        // Given
        when(orderRepository.findByOrderNumber("ORD-001")).thenReturn(Optional.of(testOrder));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(testOrderItems);

        // When
        OrderDto result = orderService.getOrderByOrderNumber("ORD-001");

        // Then
        assertNotNull(result);
        assertEquals("ORD-001", result.getOrderNumber());
    }

    @Test
    void testUpdateOrderStatus_Success() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        OrderDto result = orderService.updateOrderStatus(1L, Order.OrderStatus.CONFIRMED);

        // Then
        assertNotNull(result);
        assertEquals(Order.OrderStatus.CONFIRMED, testOrder.getStatus());
        verify(orderRepository).save(testOrder);
    }

    @Test
    void testUpdateOrderStatus_InvalidTransition() {
        // Given
        testOrder.setStatus(Order.OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> orderService.updateOrderStatus(1L, Order.OrderStatus.PENDING));
        assertTrue(exception.getMessage().contains("Invalid status transition"));
    }

    @Test
    void testCancelOrder_Success() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        OrderDto result = orderService.cancelOrder(1L);

        // Then
        assertNotNull(result);
        assertEquals(Order.OrderStatus.CANCELLED, testOrder.getStatus());
        verify(orderRepository).save(testOrder);
    }

    @Test
    void testCancelOrder_CannotCancel() {
        // Given
        testOrder.setStatus(Order.OrderStatus.SHIPPED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> orderService.cancelOrder(1L));
        assertEquals("Order cannot be cancelled in current status", exception.getMessage());
    }

    @Test
    void testGetUserOrders_Success() {
        // Given
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList(testOrder));

        // When
        List<OrderDto> result = orderService.getUserOrders(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("ORD-001", result.get(0).getOrderNumber());
    }

    @Test
    void testCalculateOrderTotal_Success() {
        // When
        BigDecimal result = orderService.calculateOrderTotal(
            new BigDecimal("99.99"), 
            new BigDecimal("8.00"), 
            new BigDecimal("5.99")
        );

        // Then
        assertEquals(new BigDecimal("113.98"), result);
    }
}