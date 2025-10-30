import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { 
  CartItem, 
  CartSummary, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartItemCount 
} from '../models/cart.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = 'http://localhost:8080/api/cart';
  
  // Cart state management
  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    subtotal: 0,
    estimatedTax: 0,
    estimatedShipping: 0,
    estimatedTotal: 0,
    currency: 'USD'
  });
  
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  
  public cartSummary$ = this.cartSummarySubject.asObservable();
  public cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartSummary();
    this.loadCartItemCount();
  }

  /**
   * Add item to cart
   */
  addToCart(request: AddToCartRequest): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/add`, request, { withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCart();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(productId: number, request: UpdateCartItemRequest): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/items/${productId}`, request, { withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCart();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${productId}`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCart();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Clear all items from cart
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCart();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get cart summary
   */
  getCartSummary(): Observable<CartSummary> {
    return this.http.get<CartSummary>(this.apiUrl, { withCredentials: true })
      .pipe(
        tap(summary => {
          this.cartSummarySubject.next(summary);
          this.cartItemCountSubject.next(summary.totalQuantity);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): Observable<CartItemCount> {
    return this.http.get<CartItemCount>(`${this.apiUrl}/count`, { withCredentials: true })
      .pipe(
        tap(result => {
          this.cartItemCountSubject.next(result.count);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Validate cart items against current inventory
   */
  validateCartInventory(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/validate`, { withCredentials: true })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Transfer guest cart to user cart (called when user logs in)
   */
  transferGuestCartToUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transfer?userId=${userId}`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCart();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Refresh cart data
   */
  refreshCart(): void {
    this.loadCartSummary();
    this.loadCartItemCount();
  }

  /**
   * Get current cart summary value
   */
  getCurrentCartSummary(): CartSummary {
    return this.cartSummarySubject.value;
  }

  /**
   * Get current cart item count value
   */
  getCurrentCartItemCount(): number {
    return this.cartItemCountSubject.value;
  }

  /**
   * Check if cart is empty
   */
  isCartEmpty(): boolean {
    return this.getCurrentCartSummary().totalItems === 0;
  }

  /**
   * Check if cart has items
   */
  hasItems(): boolean {
    return !this.isCartEmpty();
  }

  /**
   * Get cart total
   */
  getCartTotal(): number {
    return this.getCurrentCartSummary().estimatedTotal;
  }

  /**
   * Get cart subtotal
   */
  getCartSubtotal(): number {
    return this.getCurrentCartSummary().subtotal;
  }

  /**
   * Find cart item by product ID
   */
  findCartItem(productId: number): CartItem | undefined {
    return this.getCurrentCartSummary().items.find(item => item.productId === productId);
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(productId: number): boolean {
    return this.findCartItem(productId) !== undefined;
  }

  /**
   * Get quantity of product in cart
   */
  getProductQuantityInCart(productId: number): number {
    const item = this.findCartItem(productId);
    return item ? item.quantity : 0;
  }

  // Private helper methods

  private loadCartSummary(): void {
    this.getCartSummary().subscribe({
      error: (error) => {
        console.error('Error loading cart summary:', error);
        // Reset to empty cart on error
        this.cartSummarySubject.next({
          items: [],
          totalItems: 0,
          totalQuantity: 0,
          subtotal: 0,
          estimatedTax: 0,
          estimatedShipping: 0,
          estimatedTotal: 0,
          currency: 'USD'
        });
      }
    });
  }

  private loadCartItemCount(): void {
    this.getCartItemCount().subscribe({
      error: (error) => {
        console.error('Error loading cart item count:', error);
        this.cartItemCountSubject.next(0);
      }
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 404:
          errorMessage = 'Item not found.';
          break;
        case 409:
          errorMessage = 'Insufficient inventory available.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('Cart service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}