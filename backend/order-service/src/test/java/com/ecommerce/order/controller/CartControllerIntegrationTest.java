package com.ecommerce.order.controller;

import com.ecommerce.order.dto.AddToCartRequest;
import com.ecommerce.order.dto.UpdateCartItemRequest;
import com.ecommerce.order.entity.ShoppingCart;
import com.ecommerce.order.repository.ShoppingCartRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class CartControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ShoppingCartRepository cartRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private ShoppingCart testCartItem;

    @BeforeEach
    void setUp() {
        cartRepository.deleteAll();

        testCartItem = new ShoppingCart();
        testCartItem.setUserId(1L);
        testCartItem.setProductId(1L);
        testCartItem.setQuantity(2);
        testCartItem = cartRepository.save(testCartItem);
    }

    @Test
    void testAddToCart_Success() throws Exception {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(2L);
        request.setQuantity(3);

        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(2L))
                .andExpect(jsonPath("$.quantity").value(3));
    }

    @Test
    void testAddToCart_ExistingItem() throws Exception {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L); // Already exists
        request.setQuantity(1);

        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(1L))
                .andExpect(jsonPath("$.quantity").value(3)); // 2 + 1
    }

    @Test
    void testAddToCart_InvalidQuantity() throws Exception {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(2L);
        request.setQuantity(0); // Invalid quantity

        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Quantity must be positive"));
    }

    @Test
    void testUpdateCartItem_Success() throws Exception {
        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setProductId(1L);
        request.setQuantity(5);

        mockMvc.perform(put("/api/cart/update")
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(1L))
                .andExpect(jsonPath("$.quantity").value(5));
    }

    @Test
    void testUpdateCartItem_NotFound() throws Exception {
        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setProductId(999L); // Non-existent product
        request.setQuantity(5);

        mockMvc.perform(put("/api/cart/update")
                .header("Authorization", "Bearer valid-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cart item not found"));
    }

    @Test
    void testRemoveFromCart_Success() throws Exception {
        mockMvc.perform(delete("/api/cart/remove/{productId}", 1L)
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Item removed from cart"));
    }

    @Test
    void testRemoveFromCart_NotFound() throws Exception {
        mockMvc.perform(delete("/api/cart/remove/{productId}", 999L)
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpected(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cart item not found"));
    }

    @Test
    void testGetCartSummary_Success() throws Exception {
        mockMvc.perform(get("/api/cart/summary")
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].productId").value(1L))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.subtotal").exists());
    }

    @Test
    void testGetCartSummary_EmptyCart() throws Exception {
        cartRepository.deleteAll();

        mockMvc.perform(get("/api/cart/summary")
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.subtotal").value(0));
    }

    @Test
    void testClearCart_Success() throws Exception {
        mockMvc.perform(delete("/api/cart/clear")
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Cart cleared successfully"));
    }

    @Test
    void testGetCartItemCount_Success() throws Exception {
        mockMvc.perform(get("/api/cart/count")
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    void testValidateCartItems_Success() throws Exception {
        mockMvc.perform(post("/api/cart/validate")
                .header("Authorization", "Bearer valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.validationResults").isArray());
    }

    @Test
    void testTransferGuestCart_Success() throws Exception {
        // Create guest cart item
        ShoppingCart guestItem = new ShoppingCart();
        guestItem.setSessionId("guest-session-123");
        guestItem.setProductId(3L);
        guestItem.setQuantity(1);
        cartRepository.save(guestItem);

        mockMvc.perform(post("/api/cart/transfer")
                .header("Authorization", "Bearer valid-jwt-token")
                .param("sessionId", "guest-session-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Guest cart transferred successfully"))
                .andExpect(jsonPath("$.transferredItems").value(1));
    }
}