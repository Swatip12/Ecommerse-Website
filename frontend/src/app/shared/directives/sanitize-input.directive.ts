import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { SecurityService } from '../services/security.service';

@Directive({
  selector: '[appSanitizeInput]',
  standalone: true
})
export class SanitizeInputDirective {
  @Input() sanitizeOnBlur: boolean = true;
  @Input() sanitizeOnInput: boolean = false;
  @Input() allowHtml: boolean = false;

  constructor(
    private el: ElementRef,
    private control: NgControl,
    private securityService: SecurityService
  ) {}

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    if (this.sanitizeOnBlur) {
      this.sanitizeValue();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    if (this.sanitizeOnInput) {
      this.sanitizeValue();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    // Sanitize pasted content
    setTimeout(() => {
      this.sanitizeValue();
    }, 0);
  }

  private sanitizeValue(): void {
    const element = this.el.nativeElement;
    const currentValue = element.value;

    if (!currentValue || typeof currentValue !== 'string') {
      return;
    }

    let sanitizedValue: string;

    if (this.allowHtml) {
      // Allow basic HTML but remove dangerous content
      sanitizedValue = this.securityService.cleanInput(currentValue);
    } else {
      // Remove all HTML and dangerous content
      sanitizedValue = this.securityService.cleanInput(currentValue);
      // Also escape any remaining HTML entities
      sanitizedValue = this.securityService.escapeHtml(sanitizedValue);
    }

    // Update the value if it changed
    if (sanitizedValue !== currentValue) {
      element.value = sanitizedValue;
      
      // Update the form control if available
      if (this.control && this.control.control) {
        this.control.control.setValue(sanitizedValue);
      }

      // Dispatch input event to notify Angular of the change
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}