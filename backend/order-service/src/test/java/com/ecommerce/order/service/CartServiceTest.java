package com.ecommerce.order.service;

import com.ecommerce.order.dto.CartItemDto;
import com.ecommerce.order.dto.CartSummaryDto;
import com.ecommerce.order.entity.ShoppingCart;
import com.ecommerce.order.repository.ShoppingCartRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private ShoppingCartRepository cartRepository;

    @InjectMocks
    private CartService cartService;

    private ShoppingCart testCartItem;
    private List<ShoppingCart> testCartItems;

    @BeforeEach
    void setUp() {
        testCartItem = new ShoppingCart();
        testCartItem.setId(1L);
        testCartItem.setUserId(1L);
        testCartItem.setProductId(1L);
        testCartItem.setQuantity(2);

        ShoppingCart item2 = new ShoppingCart();
        item2.setId(2L);
        item2.setUserId(1L);
        item2.setProductId(2L);
        item2.setQuantity(1);

        testCartItems = Arrays.asList(testCartItem, item2);
    }

    @Test
    void testAddToCart_NewItem() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.empty());
        when(cartRepository.save(any(ShoppingCart.class))).thenReturn(testCartItem);

        // When
        CartItemDto result = cartService.addToCart(1L, 1L, 2);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getProductId());
        assertEquals(2, result.getQuantity());
        verify(cartRepository).save(any(ShoppingCart.class));
    }

    @Test
    void testAddToCart_ExistingItem() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(testCartItem));
        testCartItem.setQuantity(3); // 2 + 1
        when(cartRepository.save(any(ShoppingCart.class))).thenReturn(testCartItem);

        // When
        CartItemDto result = cartService.addToCart(1L, 1L, 1);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getProductId());
        assertEquals(3, result.getQuantity());
        verify(cartRepository).save(testCartItem);
    }

    @Test
    void testAddToCart_InvalidQuantity() {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> cartService.addToCart(1L, 1L, 0));
        assertEquals("Quantity must be positive", exception.getMessage());
    }

    @Test
    void testUpdateCartItem_Success() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(testCartItem));
        testCartItem.setQuantity(5);
        when(cartRepository.save(any(ShoppingCart.class))).thenReturn(testCartItem);

        // When
        CartItemDto result = cartService.updateCartItem(1L, 1L, 5);

        // Then
        assertNotNull(result);
        assertEquals(5, result.getQuantity());
        verify(cartRepository).save(testCartItem);
    }

    @Test
    void testUpdateCartItem_NotFound() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> cartService.updateCartItem(1L, 1L, 5));
        assertEquals("Cart item not found", exception.getMessage());
    }

    @Test
    void testRemoveFromCart_Success() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(testCartItem));

        // When
        cartService.removeFromCart(1L, 1L);

        // Then
        verify(cartRepository).delete(testCartItem);
    }

    @Test
    void testRemoveFromCart_NotFound() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> cartService.removeFromCart(1L, 1L));
        assertEquals("Cart item not found", exception.getMessage());
    }

    @Test
    void testGetCartSummary_Success() {
        // Given
        when(cartRepository.findByUserId(1L)).thenReturn(testCartItems);

        // When
        CartSummaryDto result = cartService.getCartSummary(1L);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getItems().size());
        assertEquals(3, result.getTotalItems()); // 2 + 1
        assertTrue(result.getSubtotal().compareTo(BigDecimal.ZERO) >= 0);
    }

    @Test
    void testGetCartSummary_EmptyCart() {
        // Given
        when(cartRepository.findByUserId(1L)).thenReturn(Arrays.asList());

        // When
        CartSummaryDto result = cartService.getCartSummary(1L);

        // Then
        assertNotNull(result);
        assertTrue(result.getItems().isEmpty());
        assertEquals(0, result.getTotalItems());
        assertEquals(BigDecimal.ZERO, result.getSubtotal());
    }

    @Test
    void testClearCart_Success() {
        // Given
        when(cartRepository.findByUserId(1L)).thenReturn(testCartItems);

        // When
        cartService.clearCart(1L);

        // Then
        verify(cartRepository).deleteAll(testCartItems);
    }

    @Test
    void testValidateCartItem_Success() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(testCartItem));

        // When & Then
        assertDoesNotThrow(() -> cartService.validateCartItem(1L, 1L, 2));
    }

    @Test
    void testValidateCartItem_InsufficientQuantity() {
        // Given
        when(cartRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(testCartItem));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> cartService.validateCartItem(1L, 1L, 5));
        assertTrue(exception.getMessage().contains("Insufficient quantity in cart"));
    }
}