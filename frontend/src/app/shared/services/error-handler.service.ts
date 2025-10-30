import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationDisplayService } from './notification-display.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private notificationService: NotificationDisplayService) {}

  handleError(error: any): void {
    console.error('Global error caught:', error);

    // Extract meaningful error message
    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Application Error';

    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Handle specific error types
    if (error?.name === 'ChunkLoadError') {
      errorTitle = 'Loading Error';
      errorMessage = 'Failed to load application resources. Please refresh the page.';
    } else if (error?.message?.includes('Loading chunk')) {
      errorTitle = 'Loading Error';
      errorMessage = 'Failed to load application module. Please refresh the page.';
    } else if (error?.message?.includes('Script error')) {
      errorTitle = 'Script Error';
      errorMessage = 'A script error occurred. Please refresh the page.';
    }

    // Show user-friendly error notification
    this.notificationService.showError(errorTitle, errorMessage);

    // Log to external service in production
    this.logError(error);
  }

  private logError(error: any): void {
    // In production, you would send this to a logging service
    // For now, just log to console
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error logged:', errorInfo);
    
    // TODO: Send to logging service like Sentry, LogRocket, etc.
    // this.loggingService.logError(errorInfo);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private notificationService: NotificationDisplayService) {}

  /**
   * Handle form validation errors
   */
  handleFormErrors(errors: { [key: string]: any }): void {
    const errorMessages: string[] = [];

    Object.keys(errors).forEach(field => {
      const fieldErrors = errors[field];
      const fieldName = this.formatFieldName(field);

      if (fieldErrors.required) {
        errorMessages.push(`${fieldName} is required`);
      } else if (fieldErrors.email) {
        errorMessages.push(`${fieldName} must be a valid email address`);
      } else if (fieldErrors.minlength) {
        errorMessages.push(`${fieldName} must be at least ${fieldErrors.minlength.requiredLength} characters`);
      } else if (fieldErrors.maxlength) {
        errorMessages.push(`${fieldName} cannot exceed ${fieldErrors.maxlength.requiredLength} characters`);
      } else if (fieldErrors.pattern) {
        errorMessages.push(`${fieldName} format is invalid`);
      } else if (fieldErrors.min) {
        errorMessages.push(`${fieldName} must be at least ${fieldErrors.min.min}`);
      } else if (fieldErrors.max) {
        errorMessages.push(`${fieldName} cannot exceed ${fieldErrors.max.max}`);
      } else {
        errorMessages.push(`${fieldName} is invalid`);
      }
    });

    if (errorMessages.length > 0) {
      this.notificationService.showError(
        'Form Validation Error',
        errorMessages.join('\n')
      );
    }
  }

  /**
   * Handle business logic errors
   */
  handleBusinessError(error: string, title: string = 'Operation Failed'): void {
    this.notificationService.showError(title, error);
  }

  /**
   * Handle network connectivity errors
   */
  handleNetworkError(): void {
    this.notificationService.showError(
      'Network Error',
      'Please check your internet connection and try again.'
    );
  }

  /**
   * Handle timeout errors
   */
  handleTimeoutError(): void {
    this.notificationService.showError(
      'Request Timeout',
      'The operation took too long to complete. Please try again.'
    );
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(action: string = 'perform this action'): void {
    this.notificationService.showError(
      'Permission Denied',
      `You don't have permission to ${action}.`
    );
  }

  /**
   * Handle resource not found errors
   */
  handleNotFoundError(resource: string = 'resource'): void {
    this.notificationService.showError(
      'Not Found',
      `The requested ${resource} was not found.`
    );
  }

  /**
   * Handle validation errors from server
   */
  handleServerValidationError(details: { [key: string]: string }): void {
    const errorMessages = Object.entries(details)
      .map(([field, message]) => `${this.formatFieldName(field)}: ${message}`)
      .join('\n');

    this.notificationService.showError(
      'Validation Error',
      errorMessages
    );
  }

  /**
   * Show success message
   */
  showSuccess(message: string, title: string = 'Success'): void {
    this.notificationService.showSuccess(title, message);
  }

  /**
   * Show warning message
   */
  showWarning(message: string, title: string = 'Warning'): void {
    this.notificationService.showWarning(title, message);
  }

  /**
   * Show info message
   */
  showInfo(message: string, title: string = 'Information'): void {
    this.notificationService.showInfo(title, message);
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}