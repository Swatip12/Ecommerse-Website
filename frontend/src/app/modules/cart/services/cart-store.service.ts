import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { 
  CartSummary, 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from '../models/cart.models';
import * as CartActions from '../store/cart.actions';
import * as CartSelectors from '../store/cart.selectors';

@Injectable({
  providedIn: 'root'
})
export class CartStoreService {
  
  // Observables for components to subscribe to
  cartSummary$: Observable<any>;
  cartItems$: Observable<any>;
  cartCount$: Observable<any>;
  cartTotalQuantity$: Observable<any>;
  cartSubtotal$: Observable<any>;
  cartTotal$: Observable<any>;
  cartTax$: Observable<any>;
  cartShipping$: Observable<any>;
  
  // UI state observables
  loading$: Observable<any>;
  error$: Observable<any>;
  addingToCart$: Observable<any>;
  clearing$: Observable<any>;
  transferring$: Observable<any>;
  validating$: Observable<any>;
  validationResults$: Observable<any>;
  
  // Computed observables
  isEmpty$: Observable<any>;
  hasItems$: Observable<any>;
  isFreeShipping$: Observable<any>;
  amountForFreeShipping$: Observable<any>;
  isCloseToFreeShipping$: Observable<any>;
  isProcessing$: Observable<any>;
  canCheckout$: Observable<any>;
  cartStatistics$: Observable<any>;

  constructor(private store: Store) {
    // Initialize observables
    this.cartSummary$ = this.store.select(CartSelectors.selectCartSummary);
    this.cartItems$ = this.store.select(CartSelectors.selectCartItems);
    this.cartCount$ = this.store.select(CartSelectors.selectCartCount);
    this.cartTotalQuantity$ = this.store.select(CartSelectors.selectCartTotalQuantity);
    this.cartSubtotal$ = this.store.select(CartSelectors.selectCartSubtotal);
    this.cartTotal$ = this.store.select(CartSelectors.selectCartTotal);
    this.cartTax$ = this.store.select(CartSelectors.selectCartTax);
    this.cartShipping$ = this.store.select(CartSelectors.selectCartShipping);
    
    this.loading$ = this.store.select(CartSelectors.selectCartLoading);
    this.error$ = this.store.select(CartSelectors.selectCartError);
    this.addingToCart$ = this.store.select(CartSelectors.selectAddingToCart);
    this.clearing$ = this.store.select(CartSelectors.selectCartClearing);
    this.transferring$ = this.store.select(CartSelectors.selectCartTransferring);
    this.validating$ = this.store.select(CartSelectors.selectCartValidating);
    this.validationResults$ = this.store.select(CartSelectors.selectValidationResults);
    
    this.isEmpty$ = this.store.select(CartSelectors.selectIsCartEmpty);
    this.hasItems$ = this.store.select(CartSelectors.selectHasCartItems);
    this.isFreeShipping$ = this.store.select(CartSelectors.selectIsFreeShipping);
    this.amountForFreeShipping$ = this.store.select(CartSelectors.selectAmountForFreeShipping);
    this.isCloseToFreeShipping$ = this.store.select(CartSelectors.selectIsCloseToFreeShipping);
    this.isProcessing$ = this.store.select(CartSelectors.selectIsCartProcessing);
    this.canCheckout$ = this.store.select(CartSelectors.selectCanCheckout);
    this.cartStatistics$ = this.store.select(CartSelectors.selectCartStatistics);
    // Initialize cart on service creation
    this.initializeCart();
  }

  // Action dispatchers
  loadCart(): void {
    this.store.dispatch(CartActions.loadCart());
  }

  addToCart(request: AddToCartRequest): void {
    this.store.dispatch(CartActions.addToCart({ request }));
  }

  updateCartItem(productId: number, request: UpdateCartItemRequest): void {
    this.store.dispatch(CartActions.updateCartItem({ productId, request }));
  }

  removeFromCart(productId: number): void {
    this.store.dispatch(CartActions.removeFromCart({ productId }));
  }

  clearCart(): void {
    this.store.dispatch(CartActions.clearCart());
  }

  loadCartCount(): void {
    this.store.dispatch(CartActions.loadCartCount());
  }

  transferGuestCart(userId: number): void {
    this.store.dispatch(CartActions.transferGuestCart({ userId }));
  }

  validateCart(): void {
    this.store.dispatch(CartActions.validateCart());
  }

  clearError(): void {
    this.store.dispatch(CartActions.clearCartError());
  }

  // Utility methods for specific product queries
  isProductInCart(productId: number): Observable<boolean> {
    return this.store.select(CartSelectors.selectIsProductInCart(productId));
  }

  getProductQuantityInCart(productId: number): Observable<number> {
    return this.store.select(CartSelectors.selectProductQuantityInCart(productId));
  }

  getCartItemByProductId(productId: number): Observable<CartItem | undefined> {
    return this.store.select(CartSelectors.selectCartItemByProductId(productId));
  }

  isItemUpdating(productId: number): Observable<boolean> {
    return this.store.select(CartSelectors.selectIsItemUpdating(productId));
  }

  isItemRemoving(productId: number): Observable<boolean> {
    return this.store.select(CartSelectors.selectIsItemRemoving(productId));
  }

  // Local storage and sync methods
  saveCartToLocalStorage(): void {
    this.store.dispatch(CartActions.syncCartAcrossTabs());
  }

  loadCartFromLocalStorage(): void {
    this.store.dispatch(CartActions.loadCartFromLocalStorage());
  }

  // Initialization
  private initializeCart(): void {
    // Try to load from local storage first, fallback to server
    this.loadCartFromLocalStorage();
  }

  // Convenience methods for common operations
  incrementQuantity(productId: number): void {
    this.getProductQuantityInCart(productId).subscribe(currentQuantity => {
      if (currentQuantity > 0) {
        this.updateCartItem(productId, { quantity: currentQuantity + 1 });
      }
    }).unsubscribe();
  }

  decrementQuantity(productId: number): void {
    this.getProductQuantityInCart(productId).subscribe(currentQuantity => {
      if (currentQuantity > 1) {
        this.updateCartItem(productId, { quantity: currentQuantity - 1 });
      } else if (currentQuantity === 1) {
        this.removeFromCart(productId);
      }
    }).unsubscribe();
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.updateCartItem(productId, { quantity });
    }
  }

  // Batch operations
  addMultipleItems(requests: AddToCartRequest[]): void {
    requests.forEach(request => this.addToCart(request));
  }

  removeMultipleItems(productIds: number[]): void {
    productIds.forEach(productId => this.removeFromCart(productId));
  }

  // Cart validation and cleanup
  refreshCart(): void {
    this.loadCart();
    this.validateCart();
  }

  // Event handlers for user actions
  onUserLogin(userId: number): void {
    this.transferGuestCart(userId);
  }

  onUserLogout(): void {
    // Optionally clear cart or convert to guest cart
    this.loadCart();
  }

  // Utility for getting current state synchronously (use sparingly)
  getCurrentCartSummary(): Observable<CartSummary> {
    return this.cartSummary$;
  }

  getCurrentCartCount(): Observable<number> {
    return this.cartCount$;
  }
}