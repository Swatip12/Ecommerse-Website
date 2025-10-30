import { Injectable } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor(private errorHandler: ErrorHandlerService) {}

  /**
   * Get error message for a form control
   */
  getErrorMessage(control: AbstractControl, fieldName: string): string {
    if (!control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${fieldName} is required`;
    }

    if (errors['email']) {
      return `${fieldName} must be a valid email address`;
    }

    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }

    if (errors['maxlength']) {
      return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }

    if (errors['pattern']) {
      return `${fieldName} format is invalid`;
    }

    if (errors['min']) {
      return `${fieldName} must be at least ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `${fieldName} cannot exceed ${errors['max'].max}`;
    }

    if (errors['strongPassword']) {
      const passwordErrors = errors['strongPassword'];
      const messages: string[] = [];

      if (passwordErrors.minLength) {
        messages.push('at least 8 characters');
      }
      if (passwordErrors.lowercase) {
        messages.push('one lowercase letter');
      }
      if (passwordErrors.uppercase) {
        messages.push('one uppercase letter');
      }
      if (passwordErrors.digit) {
        messages.push('one digit');
      }
      if (passwordErrors.specialChar) {
        messages.push('one special character (@$!%*?&)');
      }

      return `Password must contain ${messages.join(', ')}`;
    }

    if (errors['phone']) {
      return `${fieldName} must be a valid phone number`;
    }

    if (errors['sku']) {
      return `${fieldName} must be 3-20 characters long and contain only uppercase letters, numbers, and hyphens`;
    }

    if (errors['price']) {
      return `${fieldName} must be a valid price between 0 and 999,999.99`;
    }

    if (errors['quantity']) {
      return `${fieldName} must be a valid quantity between 0 and 999,999`;
    }

    if (errors['postalCode']) {
      return `${fieldName} must be a valid postal code`;
    }

    if (errors['noHtml']) {
      return `${fieldName} cannot contain HTML tags`;
    }

    if (errors['noScript']) {
      return `${fieldName} cannot contain script tags`;
    }

    if (errors['alphanumericWithChars']) {
      return `${fieldName} can only contain letters, numbers, and these characters: ${errors['alphanumericWithChars'].allowedChars}`;
    }

    if (errors['passwordMatch']) {
      return 'Passwords do not match';
    }

    if (errors['fileType']) {
      return `File type must be one of: ${errors['fileType'].allowedTypes.join(', ')}`;
    }

    if (errors['fileSize']) {
      const maxSizeMB = (errors['fileSize'].maxSize / (1024 * 1024)).toFixed(1);
      return `File size cannot exceed ${maxSizeMB} MB`;
    }

    if (errors['url']) {
      return `${fieldName} must be a valid URL`;
    }

    if (errors['creditCard']) {
      return `${fieldName} must be a valid credit card number`;
    }

    if (errors['dateRange']) {
      const rangeErrors = errors['dateRange'];
      if (rangeErrors.minDate) {
        return `${fieldName} cannot be before ${rangeErrors.minDate.minDate.toLocaleDateString()}`;
      }
      if (rangeErrors.maxDate) {
        return `${fieldName} cannot be after ${rangeErrors.maxDate.maxDate.toLocaleDateString()}`;
      }
    }

    // Generic error message
    return `${fieldName} is invalid`;
  }

  /**
   * Check if form control has error and is touched/dirty
   */
  hasError(control: AbstractControl): boolean {
    return !!(control.errors && (control.touched || control.dirty));
  }

  /**
   * Get all form errors as an object
   */
  getFormErrors(form: FormGroup): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && this.hasError(control)) {
        errors[key] = this.getErrorMessage(control, this.formatFieldName(key));
      }
    });

    return errors;
  }

  /**
   * Mark all form controls as touched to trigger validation display
   */
  markAllAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
        
        // If it's a nested form group, recursively mark as touched
        if (control instanceof FormGroup) {
          this.markAllAsTouched(control);
        }
      }
    });
  }

  /**
   * Validate form and show errors if invalid
   */
  validateForm(form: FormGroup, showErrors: boolean = true): boolean {
    if (form.valid) {
      return true;
    }

    this.markAllAsTouched(form);

    if (showErrors) {
      const errors = this.getFormErrors(form);
      if (Object.keys(errors).length > 0) {
        this.errorHandler.handleFormErrors(errors);
      }
    }

    return false;
  }

  /**
   * Reset form validation state
   */
  resetValidation(form: FormGroup): void {
    form.markAsUntouched();
    form.markAsPristine();
    
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        
        if (control instanceof FormGroup) {
          this.resetValidation(control);
        }
      }
    });
  }

  /**
   * Sanitize form input to prevent XSS
   */
  sanitizeFormInput(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && typeof control.value === 'string') {
        const sanitized = this.sanitizeInput(control.value);
        if (sanitized !== control.value) {
          control.setValue(sanitized);
        }
      }
    });
  }

  /**
   * Basic input sanitization
   */
  private sanitizeInput(input: string): string {
    if (!input) {
      return input;
    }

    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Format field name for display
   */
  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Create validation summary for display
   */
  getValidationSummary(form: FormGroup): string[] {
    const errors = this.getFormErrors(form);
    return Object.values(errors);
  }

  /**
   * Check if specific field has specific error
   */
  hasSpecificError(control: AbstractControl, errorType: string): boolean {
    return !!(control.errors && control.errors[errorType] && (control.touched || control.dirty));
  }

  /**
   * Get CSS classes for form control based on validation state
   */
  getValidationClasses(control: AbstractControl): string {
    if (!control.touched && !control.dirty) {
      return '';
    }

    return control.valid ? 'is-valid' : 'is-invalid';
  }
}