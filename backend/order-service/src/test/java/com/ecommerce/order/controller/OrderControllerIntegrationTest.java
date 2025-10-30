package com.ecommerce.order.controller;

import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.CreateOrderItemRequest;
import com.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.repository.OrderItemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Order testOrder;
    private OrderItem testOrderItem;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        orderItemRepository.deleteAll();

        // Create test order
        testOrder = new Order();
        testOrder.setOrderNumber("ORD-001");
        testOrder.setUserId(1L);
        testOrder.setStatus(Order.OrderStatus.PENDING);
        testOrder.setSubtotal(new BigDecimal("99.99"));
        testOrder.setTaxAmount(new BigDecimal("8.00"));
        testOrder.setShippingAmount(new BigDecimal("5.99"));
        testOrder.setTotalAmount(new BigDecimal("113.98"));
        testOrder.setPaymentStatus(Order.PaymentStatus.PENDING);
        testOrder.setShippingAddressId(1L);
        testOrder.setBillingAddressId(1L);
        testOrder = orderRepository.save(testOrder);

        // Create test order item
        testOrderItem = new OrderItem();
        testOrderItem.setOrderId(testOrder.getId());
        testOrderItem.setProductId(1L);
        testOrderItem.setProductSku("PROD-001");
        testOrderItem.setProductName("Test Product");
        testOrderItem.setQuantity(2);
        testOrderItem.setUnitPrice(new BigDecimal("49.99"));
        testOrderItem.setTotalPrice(new BigDecimal("99.98"));
        orderItemRepository.save(testOrderItem);
    }

    @Test
    void testCreateOrder_Success() throws Exception {
        CreateOrderItemRequest itemRequest = new CreateOrderItemRequest();
        itemRequest.setProductId(2L);
        itemRequest.setProductSku("PROD-002");
        itemRequest.setProductName("Test Product 2");
        itemRequest.setQuantity(1);
        itemRequest.setUnitPrice(new BigDecimal("149.99"));

        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(2L);
        request.setShippingAddressId(2L);
        request.setBillingAddressId(2L);
        request.setItems(Arrays.asList(itemRequest));

        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").exists())
                .andExpect(jsonPath("$.userId").value(2L))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].productId").value(2L));
    }

    @Test
    void testCreateOrder_InvalidRequest() throws Exception {
        CreateOrderRequest request = new CreateOrderRequest();
        // Missing required fields

        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void testGetOrderById_Success() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testOrder.getId()))
                .andExpect(jsonPath("$.orderNumber").value("ORD-001"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].productSku").value("PROD-001"));
    }

    @Test
    void testGetOrderById_NotFound() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", 999L)
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order not found"));
    }

    @Test
    void testGetOrderByOrderNumber_Success() throws Exception {
        mockMvc.perform(get("/api/orders/number/{orderNumber}", "ORD-001")
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-001"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void testGetUserOrders_Success() throws Exception {
        mockMvc.perform(get("/api/orders/user/{userId}", 1L)
                .header("Authorization", "Bearer valid-jwt-token")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].orderNumber").value("ORD-001"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void testUpdateOrderStatus_Success() throws Exception {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus(Order.OrderStatus.CONFIRMED);
        request.setNotes("Order confirmed by admin");

        mockMvc.perform(put("/api/orders/{id}/status", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void testUpdateOrderStatus_InvalidTransition() throws Exception {
        // First update to DELIVERED
        testOrder.setStatus(Order.OrderStatus.DELIVERED);
        orderRepository.save(testOrder);

        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus(Order.OrderStatus.PENDING); // Invalid transition

        mockMvc.perform(put("/api/orders/{id}/status", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid status transition"));
    }

    @Test
    void testCancelOrder_Success() throws Exception {
        mockMvc.perform(put("/api/orders/{id}/cancel", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void testCancelOrder_CannotCancel() throws Exception {
        // Update order to SHIPPED status
        testOrder.setStatus(Order.OrderStatus.SHIPPED);
        orderRepository.save(testOrder);

        mockMvc.perform(put("/api/orders/{id}/cancel", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Order cannot be cancelled in current status"));
    }

    @Test
    void testGetOrderStatusHistory_Success() throws Exception {
        mockMvc.perform(get("/api/orders/{id}/status-history", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testProcessRefund_Success() throws Exception {
        // Update order to allow refund
        testOrder.setStatus(Order.OrderStatus.DELIVERED);
        testOrder.setPaymentStatus(Order.PaymentStatus.PAID);
        orderRepository.save(testOrder);

        mockMvc.perform(post("/api/orders/{id}/refund", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token")
                .param("amount", "113.98")
                .param("reason", "Customer request"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("REFUNDED"));
    }

    @Test
    void testGetOrderSummary_Success() throws Exception {
        mockMvc.perform(get("/api/orders/{id}/summary", testOrder.getId())
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-001"))
                .andExpect(jsonPath("$.totalAmount").value(113.98))
                .andExpect(jsonPath("$.itemCount").value(1));
    }
}