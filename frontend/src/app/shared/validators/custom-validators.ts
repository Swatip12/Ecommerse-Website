import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

  /**
   * Email validator with comprehensive pattern matching
   */
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailPattern.test(control.value);
    
    return valid ? null : { email: { value: control.value } };
  }

  /**
   * Strong password validator
   * Must contain at least 8 characters, one uppercase, one lowercase, one digit, and one special character
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: any = {};

    if (password.length < 8) {
      errors.minLength = true;
    }

    if (!/[a-z]/.test(password)) {
      errors.lowercase = true;
    }

    if (!/[A-Z]/.test(password)) {
      errors.uppercase = true;
    }

    if (!/\d/.test(password)) {
      errors.digit = true;
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.specialChar = true;
    }

    return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
  }

  /**
   * Phone number validator
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const phonePattern = /^[+]?[1-9]\d{1,14}$/;
    const valid = phonePattern.test(control.value.replace(/[\s-()]/g, ''));
    
    return valid ? null : { phone: { value: control.value } };
  }

  /**
   * SKU validator
   */
  static sku(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const skuPattern = /^[A-Z0-9-]{3,20}$/;
    const valid = skuPattern.test(control.value.toUpperCase());
    
    return valid ? null : { sku: { value: control.value } };
  }

  /**
   * Price validator
   */
  static price(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const price = parseFloat(control.value);
    if (isNaN(price) || price < 0 || price > 999999.99) {
      return { price: { value: control.value } };
    }

    return null;
  }

  /**
   * Quantity validator
   */
  static quantity(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const quantity = parseInt(control.value, 10);
    if (isNaN(quantity) || quantity < 0 || quantity > 999999) {
      return { quantity: { value: control.value } };
    }

    return null;
  }

  /**
   * Postal code validator
   */
  static postalCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const postalCodePattern = /^[A-Za-z0-9\s-]{3,10}$/;
    const valid = postalCodePattern.test(control.value);
    
    return valid ? null : { postalCode: { value: control.value } };
  }

  /**
   * No HTML tags validator (XSS prevention)
   */
  static noHtml(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const htmlPattern = /<[^>]*>/;
    const hasHtml = htmlPattern.test(control.value);
    
    return hasHtml ? { noHtml: { value: control.value } } : null;
  }

  /**
   * No script tags validator (XSS prevention)
   */
  static noScript(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const scriptPattern = /<script[^>]*>.*?<\/script>/gi;
    const hasScript = scriptPattern.test(control.value);
    
    return hasScript ? { noScript: { value: control.value } } : null;
  }

  /**
   * Alphanumeric with allowed special characters
   */
  static alphanumericWithChars(allowedChars: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const pattern = new RegExp(`^[a-zA-Z0-9${allowedChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`);
      const valid = pattern.test(control.value);
      
      return valid ? null : { alphanumericWithChars: { value: control.value, allowedChars } };
    };
  }

  /**
   * Password confirmation validator
   */
  static passwordMatch(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get(passwordField);
      const confirmPassword = control;

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        return { passwordMatch: true };
      }

      return null;
    };
  }

  /**
   * File type validator
   */
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const file = control.value as File;
      if (!file || !file.type) {
        return { fileType: { allowedTypes } };
      }

      const isValid = allowedTypes.includes(file.type);
      return isValid ? null : { fileType: { actualType: file.type, allowedTypes } };
    };
  }

  /**
   * File size validator (size in bytes)
   */
  static fileSize(maxSize: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const file = control.value as File;
      if (!file || !file.size) {
        return null;
      }

      const isValid = file.size <= maxSize;
      return isValid ? null : { fileSize: { actualSize: file.size, maxSize } };
    };
  }

  /**
   * URL validator
   */
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: { value: control.value } };
    }
  }

  /**
   * Credit card number validator (basic Luhn algorithm)
   */
  static creditCard(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const cardNumber = control.value.replace(/\s/g, '');
    
    if (!/^\d+$/.test(cardNumber)) {
      return { creditCard: { value: control.value } };
    }

    // Luhn algorithm
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    const valid = (sum % 10) === 0;
    return valid ? null : { creditCard: { value: control.value } };
  }

  /**
   * Date range validator
   */
  static dateRange(minDate?: Date, maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const date = new Date(control.value);
      const errors: any = {};

      if (minDate && date < minDate) {
        errors.minDate = { actualDate: date, minDate };
      }

      if (maxDate && date > maxDate) {
        errors.maxDate = { actualDate: date, maxDate };
      }

      return Object.keys(errors).length > 0 ? { dateRange: errors } : null;
    };
  }
}