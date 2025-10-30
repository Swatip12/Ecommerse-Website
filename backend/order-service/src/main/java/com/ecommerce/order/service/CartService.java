package com.ecommerce.order.service;

import com.ecommerce.order.dto.AddToCartRequest;
import com.ecommerce.order.dto.CartItemDto;
import com.ecommerce.order.dto.CartSummaryDto;
import com.ecommerce.order.dto.UpdateCartItemRequest;
import com.ecommerce.order.entity.ShoppingCart;
import com.ecommerce.order.repository.ShoppingCartRepository;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private ShoppingCartRepository cartRepository;
    
    @Autowired
    private ProductService productService;
    
    /**
     * Add item to cart for registered user
     */
    @CacheEvict(value = "user-cart", key = "#userId")
    public CartItemDto addToCart(Long userId, AddToCartRequest request) {
        // Validate product exists and is available
        ProductResponse product = productService.getProductById(request.getProductId());
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is not available");
        }
        
        // Check inventory availability
        productService.validateProductAvailability(request.getProductId(), request.getQuantity());
        
        // Check if item already exists in cart
        Optional<ShoppingCart> existingItem = cartRepository.findByUserIdAndProductId(userId, request.getProductId());
        
        ShoppingCart cartItem;
        if (existingItem.isPresent()) {
            // Update existing item quantity
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            
            // Validate total quantity against inventory
            productService.validateProductAvailability(request.getProductId(), newQuantity);
            
            cartItem.setQuantity(newQuantity);
        } else {
            // Create new cart item
            cartItem = new ShoppingCart(userId, request.getProductId(), request.getQuantity());
        }
        
        cartItem = cartRepository.save(cartItem);
        return convertToCartItemDto(cartItem, product);
    }
    
    /**
     * Add item to cart for guest user
     */
    @CacheEvict(value = "guest-cart", key = "#sessionId")
    public CartItemDto addToCart(String sessionId, AddToCartRequest request) {
        // Validate product exists and is available
        ProductResponse product = productService.getProductById(request.getProductId());
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is not available");
        }
        
        // Check inventory availability
        productService.validateProductAvailability(request.getProductId(), request.getQuantity());
        
        // Check if item already exists in cart
        Optional<ShoppingCart> existingItem = cartRepository.findBySessionIdAndProductId(sessionId, request.getProductId());
        
        ShoppingCart cartItem;
        if (existingItem.isPresent()) {
            // Update existing item quantity
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            
            // Validate total quantity against inventory
            productService.validateProductAvailability(request.getProductId(), newQuantity);
            
            cartItem.setQuantity(newQuantity);
        } else {
            // Create new cart item
            cartItem = new ShoppingCart(sessionId, request.getProductId(), request.getQuantity());
        }
        
        cartItem = cartRepository.save(cartItem);
        return convertToCartItemDto(cartItem, product);
    }
    
    /**
     * Update cart item quantity for registered user
     */
    @CacheEvict(value = "user-cart", key = "#userId")
    public CartItemDto updateCartItem(Long userId, Long productId, UpdateCartItemRequest request) {
        ShoppingCart cartItem = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        // Validate inventory availability
        productService.validateProductAvailability(productId, request.getQuantity());
        
        cartItem.setQuantity(request.getQuantity());
        cartItem = cartRepository.save(cartItem);
        
        ProductResponse product = productService.getProductById(productId);
        return convertToCartItemDto(cartItem, product);
    }
    
    /**
     * Update cart item quantity for guest user
     */
    public CartItemDto updateCartItem(String sessionId, Long productId, UpdateCartItemRequest request) {
        ShoppingCart cartItem = cartRepository.findBySessionIdAndProductId(sessionId, productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        // Validate inventory availability
        productService.validateProductAvailability(productId, request.getQuantity());
        
        cartItem.setQuantity(request.getQuantity());
        cartItem = cartRepository.save(cartItem);
        
        ProductResponse product = productService.getProductById(productId);
        return convertToCartItemDto(cartItem, product);
    }
    
    /**
     * Remove item from cart for registered user
     */
    @CacheEvict(value = "user-cart", key = "#userId")
    public void removeFromCart(Long userId, Long productId) {
        cartRepository.deleteByUserIdAndProductId(userId, productId);
    }
    
    /**
     * Remove item from cart for guest user
     */
    public void removeFromCart(String sessionId, Long productId) {
        cartRepository.deleteBySessionIdAndProductId(sessionId, productId);
    }
    
    /**
     * Clear all items from cart for registered user
     */
    @CacheEvict(value = "user-cart", key = "#userId")
    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }
    
    /**
     * Clear all items from cart for guest user
     */
    public void clearCart(String sessionId) {
        cartRepository.deleteBySessionId(sessionId);
    }
    
    /**
     * Get cart summary for registered user
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "user-cart", key = "#userId")
    public CartSummaryDto getCartSummary(Long userId) {
        List<ShoppingCart> cartItems = cartRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return buildCartSummary(cartItems);
    }
    
    /**
     * Get cart summary for guest user
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "guest-cart", key = "#sessionId")
    public CartSummaryDto getCartSummary(String sessionId) {
        List<ShoppingCart> cartItems = cartRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
        return buildCartSummary(cartItems);
    }
    
    /**
     * Get cart item count for registered user
     */
    @Transactional(readOnly = true)
    public int getCartItemCount(Long userId) {
        return cartRepository.getTotalQuantityByUserId(userId);
    }
    
    /**
     * Get cart item count for guest user
     */
    @Transactional(readOnly = true)
    public int getCartItemCount(String sessionId) {
        return cartRepository.getTotalQuantityBySessionId(sessionId);
    }
    
    /**
     * Transfer guest cart to user cart when user logs in
     */
    public void transferGuestCartToUser(String sessionId, Long userId) {
        // Find conflicting products (products that exist in both carts)
        List<Long> conflictingProducts = cartRepository.findConflictingProducts(sessionId, userId);
        
        // For conflicting products, merge quantities
        for (Long productId : conflictingProducts) {
            Optional<ShoppingCart> guestItem = cartRepository.findBySessionIdAndProductId(sessionId, productId);
            Optional<ShoppingCart> userItem = cartRepository.findByUserIdAndProductId(userId, productId);
            
            if (guestItem.isPresent() && userItem.isPresent()) {
                int totalQuantity = guestItem.get().getQuantity() + userItem.get().getQuantity();
                
                // Validate total quantity against inventory
                try {
                    productService.validateProductAvailability(productId, totalQuantity);
                    userItem.get().setQuantity(totalQuantity);
                    cartRepository.save(userItem.get());
                } catch (RuntimeException e) {
                    // If total quantity exceeds inventory, keep user cart quantity
                    // and log the issue (in a real application, you might want to notify the user)
                }
                
                // Remove guest cart item
                cartRepository.delete(guestItem.get());
            }
        }
        
        // Transfer remaining guest cart items to user
        cartRepository.transferGuestCartToUser(sessionId, userId);
    }
    
    /**
     * Validate cart items against current inventory
     */
    @Transactional(readOnly = true)
    public List<CartItemDto> validateCartInventory(Long userId) {
        List<ShoppingCart> cartItems = cartRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return validateCartItemsInventory(cartItems);
    }
    
    /**
     * Validate cart items against current inventory for guest user
     */
    @Transactional(readOnly = true)
    public List<CartItemDto> validateCartInventory(String sessionId) {
        List<ShoppingCart> cartItems = cartRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
        return validateCartItemsInventory(cartItems);
    }
    
    // Private helper methods
    
    private CartSummaryDto buildCartSummary(List<ShoppingCart> cartItems) {
        List<CartItemDto> cartItemDtos = cartItems.stream()
                .map(this::convertToCartItemDto)
                .collect(Collectors.toList());
        
        CartSummaryDto summary = new CartSummaryDto(cartItemDtos);
        
        // Calculate estimated tax (8.5% for example)
        BigDecimal taxRate = new BigDecimal("0.085");
        summary.setEstimatedTax(summary.getSubtotal().multiply(taxRate));
        
        // Calculate estimated shipping (free shipping over $50, otherwise $5.99)
        BigDecimal shippingThreshold = new BigDecimal("50.00");
        BigDecimal shippingCost = new BigDecimal("5.99");
        if (summary.getSubtotal().compareTo(shippingThreshold) >= 0) {
            summary.setEstimatedShipping(BigDecimal.ZERO);
        } else {
            summary.setEstimatedShipping(shippingCost);
        }
        
        return summary;
    }
    
    private CartItemDto convertToCartItemDto(ShoppingCart cartItem) {
        try {
            ProductResponse product = productService.getProductById(cartItem.getProductId());
            return convertToCartItemDto(cartItem, product);
        } catch (RuntimeException e) {
            // Product might have been deleted, create a basic DTO
            CartItemDto dto = new CartItemDto();
            dto.setId(cartItem.getId());
            dto.setProductId(cartItem.getProductId());
            dto.setProductName("Product not available");
            dto.setQuantity(cartItem.getQuantity());
            dto.setUnitPrice(BigDecimal.ZERO);
            dto.setTotalPrice(BigDecimal.ZERO);
            dto.setCreatedAt(cartItem.getCreatedAt());
            dto.setUpdatedAt(cartItem.getUpdatedAt());
            return dto;
        }
    }
    
    private CartItemDto convertToCartItemDto(ShoppingCart cartItem, ProductResponse product) {
        CartItemDto dto = new CartItemDto();
        dto.setId(cartItem.getId());
        dto.setProductId(cartItem.getProductId());
        dto.setProductName(product.getName());
        dto.setProductSku(product.getSku());
        dto.setUnitPrice(product.getPrice());
        dto.setImageUrl(product.getPrimaryImageUrl());
        dto.setQuantity(cartItem.getQuantity());
        dto.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        dto.setCreatedAt(cartItem.getCreatedAt());
        dto.setUpdatedAt(cartItem.getUpdatedAt());
        return dto;
    }
    
    private List<CartItemDto> validateCartItemsInventory(List<ShoppingCart> cartItems) {
        return cartItems.stream()
                .map(cartItem -> {
                    CartItemDto dto = convertToCartItemDto(cartItem);
                    
                    // Check if product is still available and has sufficient inventory
                    try {
                        ProductResponse product = productService.getProductById(cartItem.getProductId());
                        if (!product.getIsActive() || !product.isInStock()) {
                            dto.setProductName(dto.getProductName() + " (No longer available)");
                        } else if (!productService.isProductAvailable(cartItem.getProductId(), cartItem.getQuantity())) {
                            dto.setProductName(dto.getProductName() + " (Limited stock: " + product.getAvailableQuantity() + " available)");
                        }
                    } catch (RuntimeException e) {
                        dto.setProductName(dto.getProductName() + " (Product not found)");
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
}