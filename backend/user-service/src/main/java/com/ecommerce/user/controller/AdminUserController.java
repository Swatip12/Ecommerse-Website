package com.ecommerce.user.controller;

import com.ecommerce.user.dto.UserStatisticsDto;
import com.ecommerce.user.dto.UserManagementDto;
import com.ecommerce.user.dto.CreateUserRequest;
import com.ecommerce.user.dto.UpdateUserRequest;
import com.ecommerce.user.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    
    @Autowired
    private AdminUserService adminUserService;
    
    @GetMapping("/statistics")
    public ResponseEntity<UserStatisticsDto> getUserStatistics() {
        UserStatisticsDto statistics = adminUserService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping
    public ResponseEntity<Page<UserManagementDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<UserManagementDto> users = adminUserService.getAllUsers(pageable, search);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserManagementDto> getUserById(@PathVariable Long userId) {
        UserManagementDto user = adminUserService.getUserById(userId);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    public ResponseEntity<UserManagementDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserManagementDto user = adminUserService.createUser(request);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<UserManagementDto> updateUser(
            @PathVariable Long userId, 
            @Valid @RequestBody UpdateUserRequest request) {
        UserManagementDto user = adminUserService.updateUser(userId, request);
        return ResponseEntity.ok(user);
    }
    
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminUserService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<UserManagementDto> toggleUserStatus(@PathVariable Long userId) {
        UserManagementDto user = adminUserService.toggleUserStatus(userId);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long userId) {
        String temporaryPassword = adminUserService.resetUserPassword(userId);
        return ResponseEntity.ok(Map.of("temporaryPassword", temporaryPassword));
    }
}