import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../../cart/services/cart.service';
import { 
  CheckoutData, 
  Address, 
  PaymentMethod, 
  CreateOrderRequest, 
  CreateOrderItemRequest,
  Order
} from '../../models/order.models';
import { CartItem } from '../../../cart/models/cart.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  orderSummary = {
    subtotal: 0,
    taxAmount: 0,
    shippingAmount: 0,
    totalAmount: 0,
    itemCount: 0
  };
  
  isLoading = false;
  isProcessingOrder = false;
  errors: string[] = [];
  
  // Form steps
  currentStep = 1;
  totalSteps = 3;
  
  // Address options
  savedAddresses: Address[] = [];
  useShippingForBilling = true;
  
  // Payment options
  paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Credit Card', icon: 'credit_card' },
    { value: 'DEBIT_CARD', label: 'Debit Card', icon: 'payment' },
    { value: 'PAYPAL', label: 'PayPal', icon: 'account_balance_wallet' }
  ];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCartItems();
    this.loadSavedAddresses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      // Shipping Address
      shippingAddress: this.fb.group({
        id: [null],
        streetAddress: ['', [Validators.required, Validators.maxLength(255)]],
        city: ['', [Validators.required, Validators.maxLength(100)]],
        state: ['', [Validators.required, Validators.maxLength(100)]],
        postalCode: ['', [Validators.required, Validators.maxLength(20)]],
        country: ['United States', [Validators.required, Validators.maxLength(100)]]
      }),
      
      // Billing Address
      useShippingForBilling: [true],
      billingAddress: this.fb.group({
        id: [null],
        streetAddress: [''],
        city: [''],
        state: [''],
        postalCode: [''],
        country: ['United States']
      }),
      
      // Payment Method
      paymentMethod: this.fb.group({
        type: ['CREDIT_CARD', Validators.required],
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
        expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
        cardholderName: ['', [Validators.required, Validators.maxLength(100)]],
        paypalEmail: ['']
      }),
      
      // Order Notes
      notes: ['', Validators.maxLength(1000)]
    });

    // Watch for payment method changes
    this.checkoutForm.get('paymentMethod.type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => this.updatePaymentValidators(type));

    // Watch for billing address toggle
    this.checkoutForm.get('useShippingForBilling')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(useShipping => {
        this.useShippingForBilling = useShipping;
        this.updateBillingAddressValidators(useShipping);
      });
  }

  private loadCartItems(): void {
    this.isLoading = true;
    this.cartService.getCartSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cartSummary) => {
          this.cartItems = cartSummary.items;
          this.calculateOrderSummary();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading cart items:', error);
          this.errors.push('Failed to load cart items');
          this.isLoading = false;
        }
      });
  }

  private loadSavedAddresses(): void {
    // TODO: Implement user address service to load saved addresses
    // For now, using empty array
    this.savedAddresses = [];
  }

  private calculateOrderSummary(): void {
    const items: CreateOrderItemRequest[] = this.cartItems.map(item => ({
      productId: item.productId,
      productSku: item.productSku,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    const summary = this.orderService.calculateOrderSummary(items);
    this.orderSummary = {
      ...summary,
      itemCount: this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  private updatePaymentValidators(paymentType: string): void {
    const paymentGroup = this.checkoutForm.get('paymentMethod') as FormGroup;
    
    // Clear all validators first
    Object.keys(paymentGroup.controls).forEach(key => {
      if (key !== 'type') {
        paymentGroup.get(key)?.clearValidators();
        paymentGroup.get(key)?.updateValueAndValidity();
      }
    });

    // Add validators based on payment type
    if (paymentType === 'CREDIT_CARD' || paymentType === 'DEBIT_CARD') {
      paymentGroup.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      paymentGroup.get('expiryMonth')?.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
      paymentGroup.get('expiryYear')?.setValidators([Validators.required, Validators.min(new Date().getFullYear())]);
      paymentGroup.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      paymentGroup.get('cardholderName')?.setValidators([Validators.required, Validators.maxLength(100)]);
    } else if (paymentType === 'PAYPAL') {
      paymentGroup.get('paypalEmail')?.setValidators([Validators.required, Validators.email]);
    }

    // Update validity
    Object.keys(paymentGroup.controls).forEach(key => {
      paymentGroup.get(key)?.updateValueAndValidity();
    });
  }

  private updateBillingAddressValidators(useShipping: boolean): void {
    const billingGroup = this.checkoutForm.get('billingAddress') as FormGroup;
    
    if (useShipping) {
      // Clear validators when using shipping address
      Object.keys(billingGroup.controls).forEach(key => {
        billingGroup.get(key)?.clearValidators();
        billingGroup.get(key)?.updateValueAndValidity();
      });
    } else {
      // Add validators when using separate billing address
      billingGroup.get('streetAddress')?.setValidators([Validators.required, Validators.maxLength(255)]);
      billingGroup.get('city')?.setValidators([Validators.required, Validators.maxLength(100)]);
      billingGroup.get('state')?.setValidators([Validators.required, Validators.maxLength(100)]);
      billingGroup.get('postalCode')?.setValidators([Validators.required, Validators.maxLength(20)]);
      billingGroup.get('country')?.setValidators([Validators.required, Validators.maxLength(100)]);
      
      Object.keys(billingGroup.controls).forEach(key => {
        billingGroup.get(key)?.updateValueAndValidity();
      });
    }
  }

  // Step navigation
  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
    }
  }

  previousStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.isStepValid(this.currentStep)) {
      this.currentStep = step;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Shipping Address
        return this.checkoutForm.get('shippingAddress')?.valid || false;
      case 2: // Payment Method
        const paymentValid = this.checkoutForm.get('paymentMethod')?.valid || false;
        const billingValid = this.useShippingForBilling || (this.checkoutForm.get('billingAddress')?.valid || false);
        return paymentValid && billingValid;
      case 3: // Review
        return this.checkoutForm.valid;
      default:
        return false;
    }
  }

  // Address selection
  selectSavedAddress(address: Address, type: 'shipping' | 'billing'): void {
    const addressGroup = type === 'shipping' ? 'shippingAddress' : 'billingAddress';
    this.checkoutForm.get(addressGroup)?.patchValue({
      id: address.id,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    });
  }

  // Order submission
  submitOrder(): void {
    if (!this.checkoutForm.valid) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    this.isProcessingOrder = true;
    this.errors = [];

    const formValue = this.checkoutForm.value;
    const orderRequest: CreateOrderRequest = {
      shippingAddressId: formValue.shippingAddress.id || 0, // TODO: Handle address creation
      billingAddressId: this.useShippingForBilling ? undefined : (formValue.billingAddress.id || 0),
      notes: formValue.notes,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    this.orderService.createOrder(orderRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order: Order) => {
          // Clear cart after successful order
          this.cartService.clearCart().subscribe();
          
          // Navigate to order confirmation
          this.router.navigate(['/orders/confirmation', order.orderNumber]);
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.errors.push('Failed to create order. Please try again.');
          this.isProcessingOrder = false;
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Utility methods
  getFieldError(fieldPath: string): string {
    const field = this.checkoutForm.get(fieldPath);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['pattern']) return 'Please enter a valid format';
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    }
    return '';
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.checkoutForm.get(fieldPath);
    return !!(field?.invalid && field.touched);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear + i);
    }
    return years;
  }
}