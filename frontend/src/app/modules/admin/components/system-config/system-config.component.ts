import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { SystemConfiguration } from '../../models/dashboard.models';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss']
})
export class SystemConfigComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  configForm: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  constructor(
    private adminService: AdminDashboardService,
    private fb: FormBuilder
  ) {
    this.configForm = this.fb.group({
      siteName: ['', [Validators.required, Validators.maxLength(255)]],
      siteDescription: ['', [Validators.maxLength(1000)]],
      currency: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      taxRate: [0, [Validators.required, Validators.min(0)]],
      shippingRate: [0, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [0, [Validators.required, Validators.min(0)]],
      emailNotifications: [true],
      maintenanceMode: [false],
      allowGuestCheckout: [true],
      requireEmailVerification: [true]
    });
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConfiguration(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getSystemConfiguration()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.configForm.patchValue(config);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load system configuration';
          this.loading = false;
          console.error('Load config error:', error);
        }
      });
  }

  onSave(): void {
    if (this.configForm.valid) {
      this.saving = true;
      this.error = null;
      this.successMessage = null;

      const config: SystemConfiguration = this.configForm.value;

      this.adminService.updateSystemConfiguration(config)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedConfig) => {
            this.configForm.patchValue(updatedConfig);
            this.successMessage = 'Configuration saved successfully';
            this.saving = false;
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              this.successMessage = null;
            }, 3000);
          },
          error: (error) => {
            this.error = 'Failed to save configuration';
            this.saving = false;
            console.error('Save config error:', error);
          }
        });
    }
  }

  onReset(): void {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      this.saving = true;
      this.error = null;
      this.successMessage = null;

      // For now, we'll just reset the form to default values
      // In a real implementation, you'd call a reset endpoint
      this.configForm.patchValue({
        siteName: 'E-Commerce Store',
        siteDescription: 'Your one-stop shop for all your needs',
        currency: 'USD',
        taxRate: 0.08,
        shippingRate: 9.99,
        lowStockThreshold: 10,
        emailNotifications: true,
        maintenanceMode: false,
        allowGuestCheckout: true,
        requireEmailVerification: true
      });

      this.saving = false;
      this.successMessage = 'Configuration reset to default values';
      
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    }
  }

  onCancel(): void {
    this.loadConfiguration();
    this.error = null;
    this.successMessage = null;
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.configForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.configForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} is too long`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} is too short`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be non-negative`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      siteName: 'Site Name',
      siteDescription: 'Site Description',
      currency: 'Currency',
      taxRate: 'Tax Rate',
      shippingRate: 'Shipping Rate',
      lowStockThreshold: 'Low Stock Threshold'
    };
    return labels[fieldName] || fieldName;
  }

  formatPercentage(value: number): string {
    return (value * 100).toFixed(2) + '%';
  }

  formatCurrency(value: number): string {
    return '$' + value.toFixed(2);
  }
}