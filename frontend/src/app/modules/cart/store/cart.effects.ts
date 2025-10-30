import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, fromEvent } from 'rxjs';
import { map, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CartService } from '../services/cart.service';
import * as CartActions from './cart.actions';
import { selectCartSummary } from './cart.selectors';

@Injectable()
export class CartEffects {
  private readonly CART_STORAGE_KEY = 'ecommerce_cart';

  constructor(
    private actions$: Actions,
    private cartService: CartService,
    private store: Store
  ) {
    this.initializeLocalStorageSync();
  }

  // Load Cart Effect
  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.loadCart),
      switchMap(() =>
        this.cartService.getCartSummary().pipe(
          map(cartSummary => CartActions.loadCartSuccess({ cartSummary })),
          catchError(error => of(CartActions.loadCartFailure({ error: error.message })))
        )
      )
    )
  );

  // Add to Cart Effect
  addToCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addToCart),
      switchMap(({ request }) =>
        this.cartService.addToCart(request).pipe(
          switchMap(() => 
            // Reload cart summary after adding item
            this.cartService.getCartSummary().pipe(
              map(cartSummary => CartActions.loadCartSuccess({ cartSummary }))
            )
          ),
          catchError(error => of(CartActions.addToCartFailure({ error: error.message })))
        )
      )
    )
  );

  // Update Cart Item Effect
  updateCartItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.updateCartItem),
      switchMap(({ productId, request }) =>
        this.cartService.updateCartItem(productId, request).pipe(
          map(cartItem => CartActions.updateCartItemSuccess({ cartItem })),
          catchError(error => of(CartActions.updateCartItemFailure({ error: error.message })))
        )
      )
    )
  );

  // Remove from Cart Effect
  removeFromCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.removeFromCart),
      switchMap(({ productId }) =>
        this.cartService.removeFromCart(productId).pipe(
          map(() => CartActions.removeFromCartSuccess({ productId })),
          catchError(error => of(CartActions.removeFromCartFailure({ error: error.message })))
        )
      )
    )
  );

  // Clear Cart Effect
  clearCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.clearCart),
      switchMap(() =>
        this.cartService.clearCart().pipe(
          map(() => CartActions.clearCartSuccess()),
          catchError(error => of(CartActions.clearCartFailure({ error: error.message })))
        )
      )
    )
  );

  // Load Cart Count Effect
  loadCartCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.loadCartCount),
      switchMap(() =>
        this.cartService.getCartItemCount().pipe(
          map(result => CartActions.loadCartCountSuccess({ count: result.count })),
          catchError(error => of(CartActions.loadCartCountFailure({ error: error.message })))
        )
      )
    )
  );

  // Transfer Guest Cart Effect
  transferGuestCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.transferGuestCart),
      switchMap(({ userId }) =>
        this.cartService.transferGuestCartToUser(userId).pipe(
          switchMap(() => 
            // Reload cart after transfer
            this.cartService.getCartSummary().pipe(
              map(cartSummary => CartActions.loadCartSuccess({ cartSummary }))
            )
          ),
          catchError(error => of(CartActions.transferGuestCartFailure({ error: error.message })))
        )
      )
    )
  );

  // Validate Cart Effect
  validateCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.validateCart),
      switchMap(() =>
        this.cartService.validateCartInventory().pipe(
          map(validationResults => CartActions.validateCartSuccess({ validationResults })),
          catchError(error => of(CartActions.validateCartFailure({ error: error.message })))
        )
      )
    )
  );

  // Save to Local Storage Effect
  saveToLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CartActions.loadCartSuccess,
        CartActions.addToCartSuccess,
        CartActions.updateCartItemSuccess,
        CartActions.removeFromCartSuccess,
        CartActions.clearCartSuccess
      ),
      withLatestFrom(this.store.select(selectCartSummary)),
      tap(([action, cartSummary]) => {
        try {
          localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify({
            cartSummary,
            timestamp: Date.now()
          }));
          
          // Broadcast to other tabs
          this.broadcastCartUpdate(cartSummary);
        } catch (error) {
          console.warn('Failed to save cart to localStorage:', error);
        }
      })
    ),
    { dispatch: false }
  );

  // Load from Local Storage Effect
  loadFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.loadCartFromLocalStorage),
      map(() => {
        try {
          const stored = localStorage.getItem(this.CART_STORAGE_KEY);
          if (stored) {
            const { cartSummary, timestamp } = JSON.parse(stored);
            // Only use stored data if it's less than 1 hour old
            if (Date.now() - timestamp < 3600000) {
              return CartActions.loadCartFromLocalStorageSuccess({ cartSummary });
            }
          }
        } catch (error) {
          console.warn('Failed to load cart from localStorage:', error);
        }
        // If no valid stored data, load from server
        return CartActions.loadCart();
      })
    )
  );

  // Cross-tab synchronization
  private initializeLocalStorageSync(): void {
    // Listen for storage events (cross-tab communication)
    fromEvent<StorageEvent>(window, 'storage').pipe(
      map(event => {
        if (event.key === this.CART_STORAGE_KEY && event.newValue) {
          try {
            const { cartSummary } = JSON.parse(event.newValue);
            return CartActions.cartSyncReceived({ cartSummary });
          } catch (error) {
            console.warn('Failed to parse cart sync data:', error);
            return null;
          }
        }
        return null;
      })
    ).subscribe(action => {
      if (action) {
        this.store.dispatch(action);
      }
    });

    // Listen for custom cart sync events
    fromEvent<CustomEvent>(window, 'cart-sync').pipe(
      map(event => {
        const cartSummary = event.detail;
        return CartActions.cartSyncReceived({ cartSummary });
      })
    ).subscribe(action => {
      this.store.dispatch(action);
    });
  }

  private broadcastCartUpdate(cartSummary: any): void {
    // Broadcast custom event for same-tab communication
    window.dispatchEvent(new CustomEvent('cart-sync', {
      detail: cartSummary
    }));
  }
}