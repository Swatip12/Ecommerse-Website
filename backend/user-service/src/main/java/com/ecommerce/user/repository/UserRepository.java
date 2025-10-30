package com.ecommerce.user.repository;

import com.ecommerce.user.entity.User;
import com.ecommerce.user.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailAndIsActiveTrue(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByIsActiveTrue();
    
    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.isActive = true")
    List<User> findUnverifiedActiveUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    long countActiveUsersByRole(@Param("role") UserRole role);
    
    // Admin user management methods
    long countByIsActive(boolean isActive);
    
    long countByEmailVerified(boolean emailVerified);
    
    long countByRole(UserRole role);
    
    Page<User> findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        String email, String firstName, String lastName, Pageable pageable);
    
    @Query("SELECT DATE_FORMAT(u.createdAt, '%Y-%m') as month, COUNT(u) as count " +
           "FROM User u " +
           "WHERE u.createdAt >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH) " +
           "GROUP BY DATE_FORMAT(u.createdAt, '%Y-%m') " +
           "ORDER BY month")
    List<Object[]> getUserRegistrationsByMonth();
}