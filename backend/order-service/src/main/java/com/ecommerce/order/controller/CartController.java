package com.ecommerce.order.controller;

import com.ecommerce.order.dto.AddToCartRequest;
import com.ecommerce.order.dto.CartItemDto;
import com.ecommerce.order.dto.CartSummaryDto;
import com.ecommerce.order.dto.UpdateCartItemRequest;
import com.ecommerce.order.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    /**
     * Add item to cart
     */
    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            CartItemDto cartItem;
            
            // Check if user is authenticated (in a real app, you'd get this from JWT token)
            Long userId = getUserIdFromRequest(httpRequest);
            
            if (userId != null) {
                // Registered user
                cartItem = cartService.addToCart(userId, request);
            } else {
                // Guest user - use session ID
                String sessionId = getOrCreateSessionId(httpRequest);
                cartItem = cartService.addToCart(sessionId, request);
            }
            
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update cart item quantity
     */
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartItemDto> updateCartItem(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            CartItemDto cartItem;
            
            Long userId = getUserIdFromRequest(httpRequest);
            
            if (userId != null) {
                // Registered user
                cartItem = cartService.updateCartItem(userId, productId, request);
            } else {
                // Guest user
                String sessionId = getSessionId(httpRequest);
                if (sessionId == null) {
                    return ResponseEntity.notFound().build();
                }
                cartItem = cartService.updateCartItem(sessionId, productId, request);
            }
            
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Remove item from cart
     */
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long productId,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            if (userId != null) {
                // Registered user
                cartService.removeFromCart(userId, productId);
            } else {
                // Guest user
                String sessionId = getSessionId(httpRequest);
                if (sessionId == null) {
                    return ResponseEntity.notFound().build();
                }
                cartService.removeFromCart(sessionId, productId);
            }
            
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Clear all items from cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            if (userId != null) {
                // Registered user
                cartService.clearCart(userId);
            } else {
                // Guest user
                String sessionId = getSessionId(httpRequest);
                if (sessionId != null) {
                    cartService.clearCart(sessionId);
                }
            }
            
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get cart summary
     */
    @GetMapping
    public ResponseEntity<CartSummaryDto> getCartSummary(HttpServletRequest httpRequest) {
        try {
            CartSummaryDto cartSummary;
            
            Long userId = getUserIdFromRequest(httpRequest);
            
            if (userId != null) {
                // Registered user
                cartSummary = cartService.getCartSummary(userId);
            } else {
                // Guest user
                String sessionId = getSessionId(httpRequest);
                if (sessionId == null) {
                    // Return empty cart for new sessions
                    return ResponseEntity.ok(new CartSummaryDto());
                }
                cartSummary = cartService.getCartSummary(sessionId);
            }
            
            return ResponseEntity.ok(cartSummary);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get cart item count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getCartItemCount(HttpServletRequest httpRequest) {
        try {
            int itemCount;
            
            Long userId = getUserIdFromRequest(httpRequest);
            
            if (userId != null) {
                // Registered user
                itemCount = cartService.getCartItemCount(userId);
            } else {
                // Guest user
                String sessionId = getSessionId(httpRequest);
                if (sessionId == null) {
                    itemCount = 0;
                } else {
                    itemCount = cartService.getCartItemCount(sessionId);
                }
            }
            
            return ResponseEntity.ok(Map.of("count", itemCount));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Validate cart items against current inventory
     */
    @GetMapping("/validate")
    public ResponseEntity<List<CartItemDto>> validateCartInventory(HttpServletRequest httpRequest) {
        try {
            List<CartItemDto> validationResults;
            
            Long userId = getUserIdFromRequest(httpRequest);
            
            if (userId != null) {
                // Registered user
                validationResults = cartService.validateCartInventory(userId);
            } else {
                // Guest user
                String sessionId = getSessionId(httpRequest);
                if (sessionId == null) {
                    return ResponseEntity.ok(List.of());
                }
                validationResults = cartService.validateCartInventory(sessionId);
            }
            
            return ResponseEntity.ok(validationResults);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Transfer guest cart to user cart (called when user logs in)
     */
    @PostMapping("/transfer")
    public ResponseEntity<Void> transferGuestCartToUser(
            @RequestParam Long userId,
            HttpServletRequest httpRequest) {
        
        try {
            String sessionId = getSessionId(httpRequest);
            if (sessionId != null) {
                cartService.transferGuestCartToUser(sessionId, userId);
            }
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Helper methods
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        // In a real application, you would extract the user ID from JWT token
        // For now, we'll simulate this by checking for a user ID in the session or header
        
        // Check for user ID in header (for testing purposes)
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            try {
                return Long.parseLong(userIdHeader);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        
        // Check for user ID in session
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object userId = session.getAttribute("userId");
            if (userId instanceof Long) {
                return (Long) userId;
            }
        }
        
        return null;
    }
    
    private String getSessionId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null ? session.getId() : null;
    }
    
    private String getOrCreateSessionId(HttpServletRequest request) {
        HttpSession session = request.getSession(true); // Create session if it doesn't exist
        return session.getId();
    }
}