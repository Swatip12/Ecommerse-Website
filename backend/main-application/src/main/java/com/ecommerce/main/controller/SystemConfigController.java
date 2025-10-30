package com.ecommerce.main.controller;

import com.ecommerce.main.dto.SystemConfigurationDto;
import com.ecommerce.main.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/admin/config")
@PreAuthorize("hasRole('ADMIN')")
public class SystemConfigController {
    
    @Autowired
    private SystemConfigService systemConfigService;
    
    @GetMapping
    public ResponseEntity<SystemConfigurationDto> getSystemConfiguration() {
        SystemConfigurationDto config = systemConfigService.getSystemConfiguration();
        return ResponseEntity.ok(config);
    }
    
    @PutMapping
    public ResponseEntity<SystemConfigurationDto> updateSystemConfiguration(
            @Valid @RequestBody SystemConfigurationDto configDto) {
        SystemConfigurationDto updatedConfig = systemConfigService.updateSystemConfiguration(configDto);
        return ResponseEntity.ok(updatedConfig);
    }
    
    @PostMapping("/reset")
    public ResponseEntity<SystemConfigurationDto> resetToDefaults() {
        SystemConfigurationDto config = systemConfigService.resetToDefaults();
        return ResponseEntity.ok(config);
    }
}