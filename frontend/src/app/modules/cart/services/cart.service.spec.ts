import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { CartItem, CartSummary } from '../models/cart.models';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const mockCartItem: CartItem = {
    id: 1,
    productId: 1,
    productName: 'Test Product',
    productSku: 'PROD-001',
    productImageUrl: 'test-image.jpg',
    unitPrice: 99.99,
    quantity: 2,
    totalPrice: 199.98
  };

  const mockCartSummary: CartSummary = {
    items: [mockCartItem],
    totalItems: 2,
    subtotal: 199.98,
    taxAmount: 16.00,
    shippingAmount: 5.99,
    totalAmount: 221.97
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add item to cart', () => {
    service.addToCart(1, 2).subscribe(cartItem => {
      expect(cartItem).toEqual(mockCartItem);
    });

    const req = httpMock.expectOne('/api/cart/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productId: 1, quantity: 2 });
    req.flush(mockCartItem);
  });

  it('should update cart item', () => {
    const updatedItem = { ...mockCartItem, quantity: 3, totalPrice: 299.97 };

    service.updateCartItem(1, 3).subscribe(cartItem => {
      expect(cartItem.quantity).toBe(3);
      expect(cartItem.totalPrice).toBe(299.97);
    });

    const req = httpMock.expectOne('/api/cart/update');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ productId: 1, quantity: 3 });
    req.flush(updatedItem);
  });

  it('should remove item from cart', () => {
    service.removeFromCart(1).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/cart/remove/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should get cart summary', () => {
    service.getCartSummary().subscribe(summary => {
      expect(summary).toEqual(mockCartSummary);
      expect(summary.items.length).toBe(1);
      expect(summary.totalItems).toBe(2);
    });

    const req = httpMock.expectOne('/api/cart/summary');
    expect(req.request.method).toBe('GET');
    req.flush(mockCartSummary);
  });

  it('should clear cart', () => {
    service.clearCart().subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/cart/clear');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should handle add to cart error', () => {
    service.addToCart(1, 100).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('/api/cart/add');
    req.flush('Insufficient inventory', { status: 400, statusText: 'Bad Request' });
  });

  it('should validate cart item quantity', () => {
    service.validateCartItem(1, 5).subscribe(isValid => {
      expect(isValid).toBe(true);
    });

    const req = httpMock.expectOne('/api/cart/validate?productId=1&quantity=5');
    expect(req.request.method).toBe('GET');
    req.flush({ valid: true });
  });

  it('should get cart item count', () => {
    service.getCartItemCount().subscribe(count => {
      expect(count).toBe(2);
    });

    const req = httpMock.expectOne('/api/cart/count');
    expect(req.request.method).toBe('GET');
    req.flush({ count: 2 });
  });
});