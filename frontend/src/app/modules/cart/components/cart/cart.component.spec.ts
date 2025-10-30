import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CartComponent } from './cart.component';
import { CartService } from '../../services/cart.service';
import { CartItem, CartSummary } from '../../models/cart.models';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: jasmine.SpyObj<CartService>;

  const mockCartItems: CartItem[] = [
    {
      id: 1,
      productId: 1,
      productName: 'Test Product 1',
      productSku: 'PROD-001',
      productImageUrl: 'test-image-1.jpg',
      unitPrice: 99.99,
      quantity: 2,
      totalPrice: 199.98
    },
    {
      id: 2,
      productId: 2,
      productName: 'Test Product 2',
      productSku: 'PROD-002',
      productImageUrl: 'test-image-2.jpg',
      unitPrice: 149.99,
      quantity: 1,
      totalPrice: 149.99
    }
  ];

  const mockCartSummary: CartSummary = {
    items: mockCartItems,
    totalItems: 3,
    subtotal: 349.97,
    taxAmount: 28.00,
    shippingAmount: 5.99,
    totalAmount: 383.96
  };

  beforeEach(async () => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', [
      'getCartSummary',
      'updateCartItem',
      'removeFromCart',
      'clearCart'
    ]);

    await TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: CartService, useValue: cartServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cart summary on init', () => {
    cartService.getCartSummary.and.returnValue(of(mockCartSummary));

    component.ngOnInit();

    expect(cartService.getCartSummary).toHaveBeenCalled();
    expect(component.cartSummary).toEqual(mockCartSummary);
    expect(component.loading).toBeFalse();
  });

  it('should handle empty cart', () => {
    const emptyCartSummary: CartSummary = {
      items: [],
      totalItems: 0,
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0
    };

    cartService.getCartSummary.and.returnValue(of(emptyCartSummary));

    component.ngOnInit();

    expect(component.cartSummary).toEqual(emptyCartSummary);
    expect(component.isEmpty()).toBeTrue();
  });

  it('should update item quantity', () => {
    const updatedItem = { ...mockCartItems[0], quantity: 3, totalPrice: 299.97 };
    cartService.updateCartItem.and.returnValue(of(updatedItem));
    cartService.getCartSummary.and.returnValue(of(mockCartSummary));

    component.updateQuantity(1, 3);

    expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 3);
    expect(cartService.getCartSummary).toHaveBeenCalled();
  });

  it('should handle update quantity error', () => {
    cartService.updateCartItem.and.returnValue(throwError(() => new Error('Update failed')));
    spyOn(console, 'error');

    component.updateQuantity(1, 3);

    expect(console.error).toHaveBeenCalled();
  });

  it('should remove item from cart', () => {
    cartService.removeFromCart.and.returnValue(of({ success: true }));
    cartService.getCartSummary.and.returnValue(of(mockCartSummary));
    spyOn(window, 'confirm').and.returnValue(true);

    component.removeItem(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(cartService.removeFromCart).toHaveBeenCalledWith(1);
    expect(cartService.getCartSummary).toHaveBeenCalled();
  });

  it('should not remove item if user cancels', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.removeItem(1);

    expect(cartService.removeFromCart).not.toHaveBeenCalled();
  });

  it('should clear entire cart', () => {
    cartService.clearCart.and.returnValue(of({ success: true }));
    cartService.getCartSummary.and.returnValue(of({
      items: [],
      totalItems: 0,
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0
    }));
    spyOn(window, 'confirm').and.returnValue(true);

    component.clearCart();

    expect(window.confirm).toHaveBeenCalled();
    expect(cartService.clearCart).toHaveBeenCalled();
  });

  it('should validate quantity input', () => {
    expect(component.isValidQuantity(1)).toBeTrue();
    expect(component.isValidQuantity(0)).toBeFalse();
    expect(component.isValidQuantity(-1)).toBeFalse();
    expect(component.isValidQuantity(101)).toBeFalse(); // Assuming max quantity is 100
  });

  it('should calculate item total correctly', () => {
    const item = mockCartItems[0];
    expect(component.calculateItemTotal(item)).toBe(199.98);
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(99.99)).toBe('$99.99');
    expect(component.formatPrice(100)).toBe('$100.00');
  });

  it('should track items by id', () => {
    const result = component.trackByItemId(0, mockCartItems[0]);
    expect(result).toBe(1);
  });

  it('should handle loading error', () => {
    cartService.getCartSummary.and.returnValue(throwError(() => new Error('Server error')));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to load cart');
    expect(console.error).toHaveBeenCalled();
  });

  it('should proceed to checkout', () => {
    spyOn(component.checkoutClicked, 'emit');
    component.cartSummary = mockCartSummary;

    component.proceedToCheckout();

    expect(component.checkoutClicked.emit).toHaveBeenCalledWith(mockCartSummary);
  });

  it('should continue shopping', () => {
    spyOn(component.continueShoppingClicked, 'emit');

    component.continueShopping();

    expect(component.continueShoppingClicked.emit).toHaveBeenCalled();
  });
});