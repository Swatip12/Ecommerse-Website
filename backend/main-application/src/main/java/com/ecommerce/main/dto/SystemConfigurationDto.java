package com.ecommerce.main.dto;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

public class SystemConfigurationDto {
    
    @NotBlank(message = "Site name is required")
    @Size(max = 255, message = "Site name must not exceed 255 characters")
    private String siteName;
    
    @Size(max = 1000, message = "Site description must not exceed 1000 characters")
    private String siteDescription;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String currency;
    
    @NotNull(message = "Tax rate is required")
    @DecimalMin(value = "0.0", message = "Tax rate must be non-negative")
    private BigDecimal taxRate;
    
    @NotNull(message = "Shipping rate is required")
    @DecimalMin(value = "0.0", message = "Shipping rate must be non-negative")
    private BigDecimal shippingRate;
    
    @NotNull(message = "Low stock threshold is required")
    @Min(value = 0, message = "Low stock threshold must be non-negative")
    private Integer lowStockThreshold;
    
    @NotNull(message = "Email notifications setting is required")
    private Boolean emailNotifications;
    
    @NotNull(message = "Maintenance mode setting is required")
    private Boolean maintenanceMode;
    
    @NotNull(message = "Allow guest checkout setting is required")
    private Boolean allowGuestCheckout;
    
    @NotNull(message = "Require email verification setting is required")
    private Boolean requireEmailVerification;
    
    public SystemConfigurationDto() {}
    
    public SystemConfigurationDto(String siteName, String siteDescription, String currency, 
                                BigDecimal taxRate, BigDecimal shippingRate, Integer lowStockThreshold,
                                Boolean emailNotifications, Boolean maintenanceMode, 
                                Boolean allowGuestCheckout, Boolean requireEmailVerification) {
        this.siteName = siteName;
        this.siteDescription = siteDescription;
        this.currency = currency;
        this.taxRate = taxRate;
        this.shippingRate = shippingRate;
        this.lowStockThreshold = lowStockThreshold;
        this.emailNotifications = emailNotifications;
        this.maintenanceMode = maintenanceMode;
        this.allowGuestCheckout = allowGuestCheckout;
        this.requireEmailVerification = requireEmailVerification;
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
}