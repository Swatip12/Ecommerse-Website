package com.ecommerce.main.repository;

import com.ecommerce.main.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfiguration, Long> {
    
    Optional<SystemConfiguration> findByConfigKey(String configKey);
}