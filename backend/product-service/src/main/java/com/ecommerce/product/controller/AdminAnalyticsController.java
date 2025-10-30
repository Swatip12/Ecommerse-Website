package com.ecommerce.product.controller;

import com.ecommerce.product.dto.InventoryStatisticsDto;
import com.ecommerce.product.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    @GetMapping("/inventory")
    public ResponseEntity<InventoryStatisticsDto> getInventoryStatistics() {
        InventoryStatisticsDto statistics = analyticsService.getInventoryStatistics();
        return ResponseEntity.ok(statistics);
    }
}