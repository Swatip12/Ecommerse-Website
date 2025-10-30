import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitize URL to prevent malicious redirects
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(4, url) || '';
  }

  /**
   * Clean input text to remove potentially dangerous content
   */
  cleanInput(input: string): string {
    if (!input) {
      return input;
    }

    return input
      // Remove script tags
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      // Remove iframe tags
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      // Remove object tags
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      // Remove embed tags
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      // Remove link tags
      .replace(/<link[^>]*>/gi, '')
      // Remove meta tags
      .replace(/<meta[^>]*>/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove vbscript: protocol
      .replace(/vbscript:/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove data: protocol for images (can be dangerous)
      .replace(/data:(?!image\/[a-z]+;base64,)/gi, '')
      .trim();
  }

  /**
   * Validate that input doesn't contain malicious content
   */
  isInputSafe(input: string): boolean {
    if (!input) {
      return true;
    }

    const dangerousPatterns = [
      /<script[^>]*>/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<link[^>]*>/i,
      /<meta[^>]*>/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Escape HTML entities
   */
  escapeHtml(text: string): string {
    if (!text) {
      return text;
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate file upload security
   */
  isSecureFileUpload(file: File): { isSecure: boolean; reason?: string } {
    if (!file) {
      return { isSecure: false, reason: 'No file provided' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isSecure: false, reason: 'File size exceeds 10MB limit' };
    }

    // Check for dangerous file extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', 
      '.jar', '.php', '.asp', '.jsp', '.html', '.htm', '.svg'
    ];

    const fileName = file.name.toLowerCase();
    const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasDangerousExtension) {
      return { isSecure: false, reason: 'File type not allowed' };
    }

    // Check MIME type for images
    const allowedImageTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];

    if (file.type && !allowedImageTypes.includes(file.type)) {
      return { isSecure: false, reason: 'Invalid file type' };
    }

    return { isSecure: true };
  }

  /**
   * Generate secure random string
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Use crypto.getRandomValues for secure random generation
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }

  /**
   * Validate URL format and security
   */
  isSecureUrl(url: string): boolean {
    if (!url) {
      return false;
    }

    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Block localhost and private IP ranges in production
      if (this.isProduction()) {
        const hostname = urlObj.hostname.toLowerCase();
        
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mask sensitive data for display
   */
  maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) {
      return '***';
    }

    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return visible + masked;
  }

  /**
   * Validate email format with security considerations
   */
  isSecureEmail(email: string): boolean {
    if (!email) {
      return false;
    }

    // Basic email pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailPattern.test(email)) {
      return false;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /<[^>]*>/,
      /['"]/
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(email));
  }

  /**
   * Sanitize search query to prevent injection attacks
   */
  sanitizeSearchQuery(query: string): string {
    if (!query) {
      return query;
    }

    return query
      .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim()
      .substring(0, 100);     // Limit length
  }

  /**
   * Check if running in production environment
   */
  private isProduction(): boolean {
    return !window.location.hostname.includes('localhost') && 
           !window.location.hostname.includes('127.0.0.1');
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    if (!password) {
      return { isStrong: false, score: 0, feedback: ['Password is required'] };
    }

    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character (@$!%*?&)');
    }

    // Additional length bonus
    if (password.length >= 12) {
      score += 1;
    }

    const isStrong = score >= 5;
    return { isStrong, score, feedback };
  }
}