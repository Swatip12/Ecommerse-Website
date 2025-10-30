import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationService } from '../services/form-validation.service';

@Directive({
  selector: '[appFormValidation]',
  standalone: true
})
export class FormValidationDirective implements OnInit, OnDestroy {
  @Input() fieldName: string = '';
  @Input() showErrorsOnTouch: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef,
    private control: NgControl,
    private validationService: FormValidationService
  ) {}

  ngOnInit(): void {
    if (!this.control || !this.control.control) {
      return;
    }

    // Set field name if not provided
    if (!this.fieldName) {
      this.fieldName = this.el.nativeElement.name || this.el.nativeElement.id || 'Field';
    }

    // Listen to control status changes
    this.control.control.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateValidationClasses();
      });

    // Listen to control value changes
    this.control.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateValidationClasses();
      });

    // Initial validation class update
    this.updateValidationClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateValidationClasses(): void {
    if (!this.control.control) {
      return;
    }

    const element = this.el.nativeElement;
    const control = this.control.control;

    // Remove existing validation classes
    element.classList.remove('is-valid', 'is-invalid', 'validation-error');

    // Only show validation state if control has been touched or dirty (based on configuration)
    if (this.showErrorsOnTouch && !control.touched && !control.dirty) {
      return;
    }

    // Add appropriate validation class
    const validationClasses = this.validationService.getValidationClasses(control);
    if (validationClasses) {
      element.classList.add(validationClasses);
    }

    // Add error class for styling
    if (this.validationService.hasError(control)) {
      element.classList.add('validation-error');
    }

    // Update ARIA attributes for accessibility
    this.updateAriaAttributes();
  }

  private updateAriaAttributes(): void {
    if (!this.control.control) {
      return;
    }

    const element = this.el.nativeElement;
    const control = this.control.control;

    if (this.validationService.hasError(control)) {
      const errorMessage = this.validationService.getErrorMessage(control, this.fieldName);
      element.setAttribute('aria-invalid', 'true');
      element.setAttribute('aria-describedby', `${element.id || element.name}-error`);
      
      // Create or update error message element
      this.createErrorMessageElement(errorMessage);
    } else {
      element.setAttribute('aria-invalid', 'false');
      element.removeAttribute('aria-describedby');
      
      // Remove error message element
      this.removeErrorMessageElement();
    }
  }

  private createErrorMessageElement(errorMessage: string): void {
    const element = this.el.nativeElement;
    const errorId = `${element.id || element.name}-error`;
    
    // Remove existing error message
    this.removeErrorMessageElement();

    // Create new error message element
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'validation-error-message';
    errorElement.textContent = errorMessage;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');

    // Insert error message after the input element
    element.parentNode?.insertBefore(errorElement, element.nextSibling);
  }

  private removeErrorMessageElement(): void {
    const element = this.el.nativeElement;
    const errorId = `${element.id || element.name}-error`;
    const existingError = document.getElementById(errorId);
    
    if (existingError) {
      existingError.remove();
    }
  }
}