package com.ecommerce.user.service;

import com.ecommerce.user.dto.UserStatisticsDto;
import com.ecommerce.user.dto.UserManagementDto;
import com.ecommerce.user.dto.CreateUserRequest;
import com.ecommerce.user.dto.UpdateUserRequest;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.entity.UserRole;
import com.ecommerce.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminUserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int TEMP_PASSWORD_LENGTH = 12;
    
    public UserStatisticsDto getUserStatistics() {
        UserStatisticsDto statistics = new UserStatisticsDto();
        
        // Basic user counts
        statistics.setTotalUsers(userRepository.count());
        statistics.setActiveUsers(userRepository.countByIsActive(true));
        statistics.setInactiveUsers(userRepository.countByIsActive(false));
        statistics.setVerifiedUsers(userRepository.countByEmailVerified(true));
        statistics.setUnverifiedUsers(userRepository.countByEmailVerified(false));
        
        // Role-based counts
        statistics.setAdminUsers(userRepository.countByRole(UserRole.ADMIN));
        statistics.setCustomerUsers(userRepository.countByRole(UserRole.CUSTOMER));
        
        // Users by role map
        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("ADMIN", statistics.getAdminUsers());
        usersByRole.put("CUSTOMER", statistics.getCustomerUsers());
        statistics.setUsersByRole(usersByRole);
        
        // User registrations by month (last 12 months)
        List<Object[]> registrationsByMonth = userRepository.getUserRegistrationsByMonth();
        Map<String, Long> registrationsMap = new HashMap<>();
        
        for (Object[] row : registrationsByMonth) {
            String month = (String) row[0];
            Long count = (Long) row[1];
            registrationsMap.put(month, count);
        }
        statistics.setUserRegistrationsByMonth(registrationsMap);
        
        return statistics;
    }
    
    public Page<UserManagementDto> getAllUsers(Pageable pageable, String search) {
        Page<User> users;
        
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                search, search, search, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        
        return users.map(this::convertToUserManagementDto);
    }
    
    public UserManagementDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return convertToUserManagementDto(user);
    }
    
    public UserManagementDto createUser(CreateUserRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.valueOf(request.getRole()));
        user.setActive(true);
        user.setEmailVerified(true); // Admin-created users are auto-verified
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        return convertToUserManagementDto(savedUser);
    }
    
    public UserManagementDto updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getRole() != null) {
            user.setRole(UserRole.valueOf(request.getRole()));
        }
        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return convertToUserManagementDto(savedUser);
    }
    
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Soft delete by deactivating the user instead of hard delete
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    public UserManagementDto toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setActive(!user.isActive());
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return convertToUserManagementDto(savedUser);
    }
    
    public String resetUserPassword(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        String temporaryPassword = generateTemporaryPassword();
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return temporaryPassword;
    }
    
    private UserManagementDto convertToUserManagementDto(User user) {
        return new UserManagementDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name(),
            user.isActive(),
            user.isEmailVerified(),
            user.getCreatedAt(),
            user.getLastLoginAt()
        );
    }
    
    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            int index = random.nextInt(TEMP_PASSWORD_CHARS.length());
            password.append(TEMP_PASSWORD_CHARS.charAt(index));
        }
        
        return password.toString();
    }
}