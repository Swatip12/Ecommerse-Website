package com.ecommerce.product.controller;

import com.ecommerce.product.service.LowStockAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AlertController {
    
    @Autowired
    private LowStockAlertService alertService;
    
    /**
     * Get current low stock alerts
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<LowStockAlertService.LowStockAlert>> getCurrentLowStockAlerts() {
        List<LowStockAlertService.LowStockAlert> alerts = alertService.getCurrentLowStockAlerts();
        return ResponseEntity.ok(alerts);
    }
    
    /**
     * Get current out of stock alerts
     */
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<LowStockAlertService.OutOfStockAlert>> getCurrentOutOfStockAlerts() {
        List<LowStockAlertService.OutOfStockAlert> alerts = alertService.getCurrentOutOfStockAlerts();
        return ResponseEntity.ok(alerts);
    }
    
    /**
     * Get low stock alerts by category
     */
    @GetMapping("/low-stock/category/{categoryId}")
    public ResponseEntity<List<LowStockAlertService.LowStockAlert>> getLowStockAlertsByCategory(@PathVariable Long categoryId) {
        List<LowStockAlertService.LowStockAlert> alerts = alertService.getLowStockAlertsByCategory(categoryId);
        return ResponseEntity.ok(alerts);
    }
    
    /**
     * Get low stock alerts by brand
     */
    @GetMapping("/low-stock/brand/{brand}")
    public ResponseEntity<List<LowStockAlertService.LowStockAlert>> getLowStockAlertsByBrand(@PathVariable String brand) {
        List<LowStockAlertService.LowStockAlert> alerts = alertService.getLowStockAlertsByBrand(brand);
        return ResponseEntity.ok(alerts);
    }
    
    /**
     * Get alert summary statistics
     */
    @GetMapping("/summary")
    public ResponseEntity<LowStockAlertService.AlertSummary> getAlertSummary() {
        LowStockAlertService.AlertSummary summary = alertService.getAlertSummary();
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Manually trigger low stock alert check
     */
    @PostMapping("/check")
    public ResponseEntity<String> triggerAlertCheck() {
        alertService.triggerLowStockAlertCheck();
        return ResponseEntity.ok("Low stock alert check triggered successfully");
    }
}