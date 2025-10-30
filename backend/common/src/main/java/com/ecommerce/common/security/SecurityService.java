package com.ecommerce.common.security;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.util.regex.Pattern;

@Service
public class SecurityService {
    
    private static final Pattern SCRIPT_PATTERN = Pattern.compile(
        "<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    private static final Pattern IFRAME_PATTERN = Pattern.compile(
        "<iframe[^>]*>.*?</iframe>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    private static final Pattern OBJECT_PATTERN = Pattern.compile(
        "<object[^>]*>.*?</object>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    private static final Pattern EMBED_PATTERN = Pattern.compile(
        "<embed[^>]*>.*?</embed>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    private static final Pattern LINK_PATTERN = Pattern.compile(
        "<link[^>]*>", Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern META_PATTERN = Pattern.compile(
        "<meta[^>]*>", Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern JAVASCRIPT_PATTERN = Pattern.compile(
        "javascript:", Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern VBSCRIPT_PATTERN = Pattern.compile(
        "vbscript:", Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile(
        "on\\w+\\s*=", Pattern.CASE_INSENSITIVE
    );
    
    /**
     * Sanitize input to prevent XSS attacks
     */
    public String sanitizeInput(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        String sanitized = input;
        
        // Remove dangerous HTML tags
        sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = IFRAME_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = OBJECT_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = EMBED_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = LINK_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = META_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove dangerous protocols
        sanitized = JAVASCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = VBSCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove event handlers
        sanitized = EVENT_HANDLER_PATTERN.matcher(sanitized).replaceAll("");
        
        // HTML encode remaining content
        sanitized = HtmlUtils.htmlEscape(sanitized);
        
        return sanitized.trim();
    }
    
    /**
     * Sanitize HTML content while preserving safe tags
     */
    public String sanitizeHtmlContent(String html) {
        if (!StringUtils.hasText(html)) {
            return html;
        }
        
        String sanitized = html;
        
        // Remove dangerous tags but preserve safe formatting
        sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = IFRAME_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = OBJECT_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = EMBED_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = LINK_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = META_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove dangerous protocols and event handlers
        sanitized = JAVASCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = VBSCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = EVENT_HANDLER_PATTERN.matcher(sanitized).replaceAll("");
        
        return sanitized.trim();
    }
    
    /**
     * Validate that input doesn't contain malicious content
     */
    public boolean isSafeInput(String input) {
        if (!StringUtils.hasText(input)) {
            return true;
        }
        
        // Check for dangerous patterns
        return !SCRIPT_PATTERN.matcher(input).find() &&
               !IFRAME_PATTERN.matcher(input).find() &&
               !OBJECT_PATTERN.matcher(input).find() &&
               !EMBED_PATTERN.matcher(input).find() &&
               !JAVASCRIPT_PATTERN.matcher(input).find() &&
               !VBSCRIPT_PATTERN.matcher(input).find() &&
               !EVENT_HANDLER_PATTERN.matcher(input).find();
    }
    
    /**
     * Sanitize SQL input to prevent SQL injection
     */
    public String sanitizeSqlInput(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        return input
            .replaceAll("'", "''")  // Escape single quotes
            .replaceAll("--", "")   // Remove SQL comments
            .replaceAll("/\\*.*?\\*/", "")  // Remove block comments
            .replaceAll(";", "")    // Remove statement terminators
            .trim();
    }
    
    /**
     * Generate secure random token
     */
    public String generateSecureToken(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder token = new StringBuilder();
        java.security.SecureRandom random = new java.security.SecureRandom();
        
        for (int i = 0; i < length; i++) {
            token.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return token.toString();
    }
    
    /**
     * Mask sensitive data for logging
     */
    public String maskSensitiveData(String data, int visibleChars) {
        if (!StringUtils.hasText(data) || data.length() <= visibleChars) {
            return "***";
        }
        
        String visible = data.substring(0, visibleChars);
        String masked = "*".repeat(data.length() - visibleChars);
        return visible + masked;
    }
    
    /**
     * Validate file upload security
     */
    public boolean isSecureFileUpload(String filename, String contentType) {
        if (!StringUtils.hasText(filename) || !StringUtils.hasText(contentType)) {
            return false;
        }
        
        // Check for dangerous file extensions
        String[] dangerousExtensions = {".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", ".jar", ".php", ".asp", ".jsp"};
        String lowerFilename = filename.toLowerCase();
        
        for (String ext : dangerousExtensions) {
            if (lowerFilename.endsWith(ext)) {
                return false;
            }
        }
        
        // Check for allowed content types (for images)
        String[] allowedImageTypes = {"image/jpeg", "image/png", "image/gif", "image/webp"};
        for (String type : allowedImageTypes) {
            if (contentType.equals(type)) {
                return true;
            }
        }
        
        return false;
    }
}