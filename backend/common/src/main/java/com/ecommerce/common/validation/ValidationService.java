package com.ecommerce.common.validation;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

@Service
public class ValidationService {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[+]?[1-9]\\d{1,14}$"
    );
    
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    
    private static final Pattern SKU_PATTERN = Pattern.compile(
        "^[A-Z0-9-]{3,20}$"
    );
    
    private static final Pattern POSTAL_CODE_PATTERN = Pattern.compile(
        "^[A-Za-z0-9\\s-]{3,10}$"
    );
    
    /**
     * Validate email format
     */
    public boolean isValidEmail(String email) {
        return StringUtils.hasText(email) && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validate phone number format
     */
    public boolean isValidPhone(String phone) {
        return StringUtils.hasText(phone) && PHONE_PATTERN.matcher(phone).matches();
    }
    
    /**
     * Validate password strength
     * Must contain at least 8 characters, one uppercase, one lowercase, one digit, and one special character
     */
    public boolean isValidPassword(String password) {
        return StringUtils.hasText(password) && PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * Validate SKU format
     */
    public boolean isValidSku(String sku) {
        return StringUtils.hasText(sku) && SKU_PATTERN.matcher(sku).matches();
    }
    
    /**
     * Validate postal code format
     */
    public boolean isValidPostalCode(String postalCode) {
        return StringUtils.hasText(postalCode) && POSTAL_CODE_PATTERN.matcher(postalCode).matches();
    }
    
    /**
     * Sanitize input to prevent XSS attacks
     */
    public String sanitizeInput(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        return input
            .replaceAll("<script[^>]*>.*?</script>", "")
            .replaceAll("<iframe[^>]*>.*?</iframe>", "")
            .replaceAll("<object[^>]*>.*?</object>", "")
            .replaceAll("<embed[^>]*>.*?</embed>", "")
            .replaceAll("<link[^>]*>", "")
            .replaceAll("<meta[^>]*>", "")
            .replaceAll("javascript:", "")
            .replaceAll("vbscript:", "")
            .replaceAll("onload=", "")
            .replaceAll("onerror=", "")
            .replaceAll("onclick=", "")
            .replaceAll("onmouseover=", "")
            .trim();
    }
    
    /**
     * Validate price range
     */
    public boolean isValidPrice(Double price) {
        return price != null && price >= 0 && price <= 999999.99;
    }
    
    /**
     * Validate quantity
     */
    public boolean isValidQuantity(Integer quantity) {
        return quantity != null && quantity >= 0 && quantity <= 999999;
    }
    
    /**
     * Validate string length
     */
    public boolean isValidLength(String value, int minLength, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return minLength == 0;
        }
        return value.length() >= minLength && value.length() <= maxLength;
    }
    
    /**
     * Check if string contains only alphanumeric characters and allowed special characters
     */
    public boolean isAlphanumericWithSpecialChars(String value, String allowedSpecialChars) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        
        String pattern = "^[a-zA-Z0-9" + Pattern.quote(allowedSpecialChars) + "]+$";
        return Pattern.matches(pattern, value);
    }
    
    /**
     * Validate order number format
     */
    public boolean isValidOrderNumber(String orderNumber) {
        return StringUtils.hasText(orderNumber) && 
               Pattern.matches("^ORD-\\d{8}-[A-Z0-9]{6}$", orderNumber);
    }
    
    /**
     * Generate secure order number
     */
    public String generateOrderNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(5);
        String random = java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + timestamp + "-" + random;
    }
}