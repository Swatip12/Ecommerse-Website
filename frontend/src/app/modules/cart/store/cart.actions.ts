import { createAction, props } from '@ngrx/store';
import { CartItem, CartSummary, AddToCartRequest, UpdateCartItemRequest } from '../models/cart.models';

// Load Cart Actions
export const loadCart = createAction('[Cart] Load Cart');
export const loadCartSuccess = createAction(
  '[Cart] Load Cart Success',
  props<{ cartSummary: CartSummary }>()
);
export const loadCartFailure = createAction(
  '[Cart] Load Cart Failure',
  props<{ error: string }>()
);

// Add to Cart Actions
export const addToCart = createAction(
  '[Cart] Add to Cart',
  props<{ request: AddToCartRequest }>()
);
export const addToCartSuccess = createAction(
  '[Cart] Add to Cart Success',
  props<{ cartItem: CartItem }>()
);
export const addToCartFailure = createAction(
  '[Cart] Add to Cart Failure',
  props<{ error: string }>()
);

// Update Cart Item Actions
export const updateCartItem = createAction(
  '[Cart] Update Cart Item',
  props<{ productId: number; request: UpdateCartItemRequest }>()
);
export const updateCartItemSuccess = createAction(
  '[Cart] Update Cart Item Success',
  props<{ cartItem: CartItem }>()
);
export const updateCartItemFailure = createAction(
  '[Cart] Update Cart Item Failure',
  props<{ error: string }>()
);

// Remove from Cart Actions
export const removeFromCart = createAction(
  '[Cart] Remove from Cart',
  props<{ productId: number }>()
);
export const removeFromCartSuccess = createAction(
  '[Cart] Remove from Cart Success',
  props<{ productId: number }>()
);
export const removeFromCartFailure = createAction(
  '[Cart] Remove from Cart Failure',
  props<{ error: string }>()
);

// Clear Cart Actions
export const clearCart = createAction('[Cart] Clear Cart');
export const clearCartSuccess = createAction('[Cart] Clear Cart Success');
export const clearCartFailure = createAction(
  '[Cart] Clear Cart Failure',
  props<{ error: string }>()
);

// Load Cart Count Actions
export const loadCartCount = createAction('[Cart] Load Cart Count');
export const loadCartCountSuccess = createAction(
  '[Cart] Load Cart Count Success',
  props<{ count: number }>()
);
export const loadCartCountFailure = createAction(
  '[Cart] Load Cart Count Failure',
  props<{ error: string }>()
);

// Transfer Guest Cart Actions
export const transferGuestCart = createAction(
  '[Cart] Transfer Guest Cart',
  props<{ userId: number }>()
);
export const transferGuestCartSuccess = createAction('[Cart] Transfer Guest Cart Success');
export const transferGuestCartFailure = createAction(
  '[Cart] Transfer Guest Cart Failure',
  props<{ error: string }>()
);

// Validate Cart Actions
export const validateCart = createAction('[Cart] Validate Cart');
export const validateCartSuccess = createAction(
  '[Cart] Validate Cart Success',
  props<{ validationResults: CartItem[] }>()
);
export const validateCartFailure = createAction(
  '[Cart] Validate Cart Failure',
  props<{ error: string }>()
);

// UI State Actions
export const setCartLoading = createAction(
  '[Cart] Set Loading',
  props<{ loading: boolean }>()
);
export const setCartError = createAction(
  '[Cart] Set Error',
  props<{ error: string | null }>()
);
export const clearCartError = createAction('[Cart] Clear Error');

// Local Storage Actions
export const saveCartToLocalStorage = createAction(
  '[Cart] Save to Local Storage',
  props<{ cartSummary: CartSummary }>()
);
export const loadCartFromLocalStorage = createAction('[Cart] Load from Local Storage');
export const loadCartFromLocalStorageSuccess = createAction(
  '[Cart] Load from Local Storage Success',
  props<{ cartSummary: CartSummary }>()
);

// Sync Actions (for cross-tab synchronization)
export const syncCartAcrossTabs = createAction('[Cart] Sync Across Tabs');
export const cartSyncReceived = createAction(
  '[Cart] Sync Received',
  props<{ cartSummary: CartSummary }>()
);