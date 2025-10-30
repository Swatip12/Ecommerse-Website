package com.ecommerce.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.Cache;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

@Service
public class CacheInvalidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(CacheInvalidationService.class);
    
    @Autowired
    private CacheManager cacheManager;
    
    /**
     * Invalidate all product-related caches
     */
    public void invalidateProductCaches() {
        List<String> productCaches = Arrays.asList(
            "products", "products-by-sku", "product-brands", 
            "product-price-range", "product-catalog", "product-search"
        );
        
        productCaches.forEach(this::evictCache);
        logger.info("Invalidated all product-related caches");
    }
    
    /**
     * Invalidate specific product cache by ID
     */
    public void invalidateProductCache(Long productId) {
        Cache productCache = cacheManager.getCache("products");
        if (productCache != null) {
            productCache.evict(productId);
            logger.info("Invalidated product cache for ID: {}", productId);
        }
        
        // Also invalidate catalog and search caches as they might contain this product
        evictCache("product-catalog");
        evictCache("product-search");
    }
    
    /**
     * Invalidate specific product cache by SKU
     */
    public void invalidateProductCacheBySku(String sku) {
        Cache productSkuCache = cacheManager.getCache("products-by-sku");
        if (productSkuCache != null) {
            productSkuCache.evict(sku);
            logger.info("Invalidated product cache for SKU: {}", sku);
        }
    }
    
    /**
     * Invalidate user cart cache
     */
    public void invalidateUserCartCache(Long userId) {
        Cache userCartCache = cacheManager.getCache("user-cart");
        if (userCartCache != null) {
            userCartCache.evict(userId);
            logger.info("Invalidated user cart cache for user ID: {}", userId);
        }
    }
    
    /**
     * Invalidate guest cart cache
     */
    public void invalidateGuestCartCache(String sessionId) {
        Cache guestCartCache = cacheManager.getCache("guest-cart");
        if (guestCartCache != null) {
            guestCartCache.evict(sessionId);
            logger.info("Invalidated guest cart cache for session ID: {}", sessionId);
        }
    }
    
    /**
     * Invalidate all cart caches (useful for inventory updates)
     */
    public void invalidateAllCartCaches() {
        evictCache("user-cart");
        evictCache("guest-cart");
        logger.info("Invalidated all cart caches");
    }
    
    /**
     * Invalidate catalog and search caches (useful for product updates)
     */
    public void invalidateCatalogCaches() {
        evictCache("product-catalog");
        evictCache("product-search");
        evictCache("product-brands");
        evictCache("product-price-range");
        logger.info("Invalidated catalog and search caches");
    }
    
    /**
     * Warm up frequently accessed caches
     */
    public void warmUpCaches() {
        // This method can be called during application startup or scheduled
        // to pre-populate frequently accessed data
        logger.info("Cache warm-up initiated");
        
        // Implementation would depend on specific services
        // For example, pre-load popular products, categories, etc.
    }
    
    /**
     * Get cache statistics for monitoring
     */
    public void logCacheStatistics() {
        List<String> cacheNames = Arrays.asList(
            "products", "products-by-sku", "product-brands", "product-price-range",
            "product-catalog", "product-search", "user-cart", "guest-cart"
        );
        
        cacheNames.forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                // Log cache statistics if available
                logger.info("Cache '{}' is active", cacheName);
            }
        });
    }
    
    private void evictCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            logger.debug("Evicted cache: {}", cacheName);
        }
    }
}