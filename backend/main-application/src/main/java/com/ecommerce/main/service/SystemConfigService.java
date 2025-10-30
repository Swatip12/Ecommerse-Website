package com.ecommerce.main.service;

import com.ecommerce.main.dto.SystemConfigurationDto;
import com.ecommerce.main.entity.SystemConfiguration;
import com.ecommerce.main.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class SystemConfigService {
    
    @Autowired
    private SystemConfigRepository systemConfigRepository;
    
    private static final String DEFAULT_CONFIG_KEY = "SYSTEM_CONFIG";
    
    public SystemConfigurationDto getSystemConfiguration() {
        SystemConfiguration config = systemConfigRepository.findByConfigKey(DEFAULT_CONFIG_KEY)
            .orElse(createDefaultConfiguration());
        
        return convertToDto(config);
    }
    
    public SystemConfigurationDto updateSystemConfiguration(SystemConfigurationDto configDto) {
        SystemConfiguration config = systemConfigRepository.findByConfigKey(DEFAULT_CONFIG_KEY)
            .orElse(new SystemConfiguration());
        
        config.setConfigKey(DEFAULT_CONFIG_KEY);
        config.setSiteName(configDto.getSiteName());
        config.setSiteDescription(configDto.getSiteDescription());
        config.setCurrency(configDto.getCurrency());
        config.setTaxRate(configDto.getTaxRate());
        config.setShippingRate(configDto.getShippingRate());
        config.setLowStockThreshold(configDto.getLowStockThreshold());
        config.setEmailNotifications(configDto.getEmailNotifications());
        config.setMaintenanceMode(configDto.getMaintenanceMode());
        config.setAllowGuestCheckout(configDto.getAllowGuestCheckout());
        config.setRequireEmailVerification(configDto.getRequireEmailVerification());
        
        SystemConfiguration savedConfig = systemConfigRepository.save(config);
        return convertToDto(savedConfig);
    }
    
    public SystemConfigurationDto resetToDefaults() {
        SystemConfiguration config = createDefaultConfiguration();
        SystemConfiguration savedConfig = systemConfigRepository.save(config);
        return convertToDto(savedConfig);
    }
    
    private SystemConfiguration createDefaultConfiguration() {
        SystemConfiguration config = new SystemConfiguration();
        config.setConfigKey(DEFAULT_CONFIG_KEY);
        config.setSiteName("E-Commerce Store");
        config.setSiteDescription("Your one-stop shop for all your needs");
        config.setCurrency("USD");
        config.setTaxRate(new BigDecimal("0.08")); // 8% tax
        config.setShippingRate(new BigDecimal("9.99")); // $9.99 shipping
        config.setLowStockThreshold(10);
        config.setEmailNotifications(true);
        config.setMaintenanceMode(false);
        config.setAllowGuestCheckout(true);
        config.setRequireEmailVerification(true);
        
        return config;
    }
    
    private SystemConfigurationDto convertToDto(SystemConfiguration config) {
        return new SystemConfigurationDto(
            config.getSiteName(),
            config.getSiteDescription(),
            config.getCurrency(),
            config.getTaxRate(),
            config.getShippingRate(),
            config.getLowStockThreshold(),
            config.getEmailNotifications(),
            config.getMaintenanceMode(),
            config.getAllowGuestCheckout(),
            config.getRequireEmailVerification()
        );
    }
}