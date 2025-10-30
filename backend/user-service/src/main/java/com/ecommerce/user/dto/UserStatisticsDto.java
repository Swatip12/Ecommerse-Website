package com.ecommerce.user.dto;

import java.util.Map;

public class UserStatisticsDto {
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long adminUsers;
    private long customerUsers;
    private long verifiedUsers;
    private long unverifiedUsers;
    private Map<String, Long> usersByRole;
    private Map<String, Long> userRegistrationsByMonth;
    
    public UserStatisticsDto() {}
    
    public long getTotalUsers() {
        return totalUsers;
    }
    
    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }
    
    public long getActiveUsers() {
        return activeUsers;
    }
    
    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }
    
    public long getInactiveUsers() {
        return inactiveUsers;
    }
    
    public void setInactiveUsers(long inactiveUsers) {
        this.inactiveUsers = inactiveUsers;
    }
    
    public long getAdminUsers() {
        return adminUsers;
    }
    
    public void setAdminUsers(long adminUsers) {
        this.adminUsers = adminUsers;
    }
    
    public long getCustomerUsers() {
        return customerUsers;
    }
    
    public void setCustomerUsers(long customerUsers) {
        this.customerUsers = customerUsers;
    }
    
    public long getVerifiedUsers() {
        return verifiedUsers;
    }
    
    public void setVerifiedUsers(long verifiedUsers) {
        this.verifiedUsers = verifiedUsers;
    }
    
    public long getUnverifiedUsers() {
        return unverifiedUsers;
    }
    
    public void setUnverifiedUsers(long unverifiedUsers) {
        this.unverifiedUsers = unverifiedUsers;
    }
    
    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }
    
    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }
    
    public Map<String, Long> getUserRegistrationsByMonth() {
        return userRegistrationsByMonth;
    }
    
    public void setUserRegistrationsByMonth(Map<String, Long> userRegistrationsByMonth) {
        this.userRegistrationsByMonth = userRegistrationsByMonth;
    }
}