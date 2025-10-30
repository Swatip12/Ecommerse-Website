package com.ecommerce.product.service;

import com.ecommerce.product.dto.InventoryStatisticsDto;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.repository.ProductInventoryRepository;
import com.ecommerce.product.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductInventoryRepository inventoryRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public InventoryStatisticsDto getInventoryStatistics() {
        InventoryStatisticsDto statistics = new InventoryStatisticsDto();
        
        // Basic product counts
        statistics.setTotalProducts(productRepository.count());
        statistics.setActiveProducts(productRepository.countByIsActive(true));
        statistics.setInactiveProducts(productRepository.countByIsActive(false));
        
        // Stock-related counts
        statistics.setLowStockProducts(inventoryRepository.countLowStockProducts());
        statistics.setOutOfStockProducts(inventoryRepository.countByQuantityAvailable(0));
        
        // Calculate total inventory value
        BigDecimal totalValue = productRepository.calculateTotalInventoryValue();
        statistics.setTotalInventoryValue(totalValue != null ? totalValue : BigDecimal.ZERO);
        
        // Products by category
        List<Object[]> productsByCategory = productRepository.countProductsByCategory();
        Map<String, Long> categoryMap = new HashMap<>();
        Map<String, BigDecimal> categoryValueMap = new HashMap<>();
        
        for (Object[] row : productsByCategory) {
            String categoryName = (String) row[0];
            Long count = (Long) row[1];
            BigDecimal value = (BigDecimal) row[2];
            
            categoryMap.put(categoryName, count);
            categoryValueMap.put(categoryName, value != null ? value : BigDecimal.ZERO);
        }
        
        statistics.setProductsByCategory(categoryMap);
        statistics.setInventoryValueByCategory(categoryValueMap);
        
        return statistics;
    }
}