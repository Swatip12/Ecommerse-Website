import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationDisplayService } from '../services/notification-display.service';
import { Router } from '@angular/router';

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: { [key: string]: string };
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private notificationService: NotificationDisplayService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, request);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>): void {
    // Don't show notifications for auth endpoints to avoid duplicate messages
    if (this.isAuthEndpoint(request.url)) {
      return;
    }

    const errorResponse = this.parseErrorResponse(error);
    
    switch (error.status) {
      case 0:
        // Network error
        this.notificationService.showError(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection.'
        );
        break;
        
      case 400:
        // Bad Request
        if (errorResponse.details && Object.keys(errorResponse.details).length > 0) {
          // Validation errors
          this.handleValidationErrors(errorResponse.details);
        } else {
          this.notificationService.showError(
            'Invalid Request',
            errorResponse.message || 'Please check your input and try again.'
          );
        }
        break;
        
      case 401:
        // Unauthorized - handled by JWT interceptor, but show message if not auth endpoint
        this.notificationService.showError(
          'Authentication Required',
          'Please log in to continue.'
        );
        this.router.navigate(['/auth/login']);
        break;
        
      case 403:
        // Forbidden
        this.notificationService.showError(
          'Access Denied',
          'You don\'t have permission to perform this action.'
        );
        break;
        
      case 404:
        // Not Found
        this.notificationService.showError(
          'Not Found',
          errorResponse.message || 'The requested resource was not found.'
        );
        break;
        
      case 409:
        // Conflict
        this.notificationService.showError(
          'Data Conflict',
          errorResponse.message || 'The operation could not be completed due to a conflict.'
        );
        break;
        
      case 422:
        // Unprocessable Entity
        this.notificationService.showError(
          'Validation Error',
          errorResponse.message || 'The provided data is invalid.'
        );
        break;
        
      case 429:
        // Too Many Requests
        this.notificationService.showWarning(
          'Rate Limit Exceeded',
          'Too many requests. Please wait a moment before trying again.'
        );
        break;
        
      case 500:
        // Internal Server Error
        this.notificationService.showError(
          'Server Error',
          'An unexpected error occurred. Please try again later.'
        );
        break;
        
      case 502:
        // Bad Gateway
        this.notificationService.showError(
          'Service Unavailable',
          'The service is temporarily unavailable. Please try again later.'
        );
        break;
        
      case 503:
        // Service Unavailable
        this.notificationService.showError(
          'Service Unavailable',
          'The service is currently under maintenance. Please try again later.'
        );
        break;
        
      case 504:
        // Gateway Timeout
        this.notificationService.showError(
          'Request Timeout',
          'The request took too long to complete. Please try again.'
        );
        break;
        
      default:
        // Generic error
        this.notificationService.showError(
          'Error',
          errorResponse.message || 'An unexpected error occurred. Please try again.'
        );
        break;
    }
  }

  private parseErrorResponse(error: HttpErrorResponse): ApiErrorResponse {
    // Try to parse the error response
    if (error.error && typeof error.error === 'object') {
      return error.error as ApiErrorResponse;
    }
    
    // Fallback to basic error information
    return {
      timestamp: new Date().toISOString(),
      status: error.status,
      error: error.statusText || 'Unknown Error',
      message: error.message || 'An unexpected error occurred',
      path: error.url || 'unknown'
    };
  }

  private handleValidationErrors(details: { [key: string]: string }): void {
    // Show individual field validation errors
    const errorMessages = Object.entries(details)
      .map(([field, message]) => `${this.formatFieldName(field)}: ${message}`)
      .join('\n');
    
    this.notificationService.showError(
      'Validation Errors',
      errorMessages
    );
  }

  private formatFieldName(fieldName: string): string {
    // Convert camelCase to readable format
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/api/auth/') || url.includes('/api/users/login') || url.includes('/api/users/register');
  }
}