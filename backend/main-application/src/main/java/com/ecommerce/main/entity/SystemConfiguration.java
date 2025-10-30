package com.ecommerce.main.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_configuration")
public class SystemConfiguration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "config_key", unique = true, nullable = false)
    private String configKey;
    
    @Column(name = "site_name", nullable = false)
    private String siteName;
    
    @Column(name = "site_description", length = 1000)
    private String siteDescription;
    
    @Column(name = "currency", nullable = false, length = 3)
    private String currency;
    
    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal taxRate;
    
    @Column(name = "shipping_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal shippingRate;
    
    @Column(name = "low_stock_threshold", nullable = false)
    private Integer lowStockThreshold;
    
    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications;
    
    @Column(name = "maintenance_mode", nullable = false)
    private Boolean maintenanceMode;
    
    @Column(name = "allow_guest_checkout", nullable = false)
    private Boolean allowGuestCheckout;
    
    @Column(name = "require_email_verification", nullable = false)
    private Boolean requireEmailVerification;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public SystemConfiguration() {}
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getConfigKey() {
        return configKey;
    }
    
    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }
    
    public String getSiteName() {
        return siteName;
    }
    
    public void setSiteName(String siteName) {
        this.siteName = siteName;
    }
    
    public String getSiteDescription() {
        return siteDescription;
    }
    
    public void setSiteDescription(String siteDescription) {
        this.siteDescription = siteDescription;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public BigDecimal getTaxRate() {
        return taxRate;
    }
    
    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }
    
    public BigDecimal getShippingRate() {
        return shippingRate;
    }
    
    public void setShippingRate(BigDecimal shippingRate) {
        this.shippingRate = shippingRate;
    }
    
    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }
    
    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }
    
    public Boolean getEmailNotifications() {
        return emailNotifications;
    }
    
    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }
    
    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }
    
    public void setMaintenanceMode(Boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }
    
    public Boolean getAllowGuestCheckout() {
        return allowGuestCheckout;
    }
    
    public void setAllowGuestCheckout(Boolean allowGuestCheckout) {
        this.allowGuestCheckout = allowGuestCheckout;
    }
    
    public Boolean getRequireEmailVerification() {
        return requireEmailVerification;
    }
    
    public void setRequireEmailVerification(Boolean requireEmailVerification) {
        this.requireEmailVerification = requireEmailVerification;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}