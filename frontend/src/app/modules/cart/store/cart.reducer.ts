import { createReducer, on } from '@ngrx/store';
import { CartState, initialCartState } from './cart.state';
import * as CartActions from './cart.actions';

export const cartReducer = createReducer(
  initialCartState,

  // Load Cart
  on(CartActions.loadCart, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CartActions.loadCartSuccess, (state, { cartSummary }) => ({
    ...state,
    cartSummary,
    cartCount: cartSummary.totalQuantity,
    loading: false,
    error: null,
    lastSyncTimestamp: Date.now()
  })),
  on(CartActions.loadCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Add to Cart
  on(CartActions.addToCart, (state) => ({
    ...state,
    addingToCart: true,
    error: null
  })),
  on(CartActions.addToCartSuccess, (state, { cartItem }) => {
    // Update the cart summary with the new/updated item
    const existingItemIndex = state.cartSummary.items.findIndex(
      item => item.productId === cartItem.productId
    );
    
    let updatedItems;
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = state.cartSummary.items.map((item, index) =>
        index === existingItemIndex ? cartItem : item
      );
    } else {
      // Add new item
      updatedItems = [...state.cartSummary.items, cartItem];
    }
    
    // Recalculate totals
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const estimatedTax = subtotal * 0.085; // 8.5% tax
    const estimatedShipping = subtotal >= 50 ? 0 : 5.99;
    const estimatedTotal = subtotal + estimatedTax + estimatedShipping;
    
    const updatedCartSummary = {
      ...state.cartSummary,
      items: updatedItems,
      totalItems: updatedItems.length,
      totalQuantity,
      subtotal,
      estimatedTax,
      estimatedShipping,
      estimatedTotal
    };
    
    return {
      ...state,
      cartSummary: updatedCartSummary,
      cartCount: totalQuantity,
      addingToCart: false,
      error: null,
      lastSyncTimestamp: Date.now()
    };
  }),
  on(CartActions.addToCartFailure, (state, { error }) => ({
    ...state,
    addingToCart: false,
    error
  })),

  // Update Cart Item
  on(CartActions.updateCartItem, (state, { productId }) => ({
    ...state,
    updatingItems: [...state.updatingItems, productId],
    error: null
  })),
  on(CartActions.updateCartItemSuccess, (state, { cartItem }) => {
    const updatedItems = state.cartSummary.items.map(item =>
      item.productId === cartItem.productId ? cartItem : item
    );
    
    // Recalculate totals
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const estimatedTax = subtotal * 0.085;
    const estimatedShipping = subtotal >= 50 ? 0 : 5.99;
    const estimatedTotal = subtotal + estimatedTax + estimatedShipping;
    
    const updatedCartSummary = {
      ...state.cartSummary,
      items: updatedItems,
      totalItems: updatedItems.length,
      totalQuantity,
      subtotal,
      estimatedTax,
      estimatedShipping,
      estimatedTotal
    };
    
    return {
      ...state,
      cartSummary: updatedCartSummary,
      cartCount: totalQuantity,
      updatingItems: state.updatingItems.filter(id => id !== cartItem.productId),
      error: null,
      lastSyncTimestamp: Date.now()
    };
  }),
  on(CartActions.updateCartItemFailure, (state, { error }) => ({
    ...state,
    updatingItems: [],
    error
  })),

  // Remove from Cart
  on(CartActions.removeFromCart, (state, { productId }) => ({
    ...state,
    removingItems: [...state.removingItems, productId],
    error: null
  })),
  on(CartActions.removeFromCartSuccess, (state, { productId }) => {
    const updatedItems = state.cartSummary.items.filter(item => item.productId !== productId);
    
    // Recalculate totals
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const estimatedTax = subtotal * 0.085;
    const estimatedShipping = subtotal >= 50 ? 0 : 5.99;
    const estimatedTotal = subtotal + estimatedTax + estimatedShipping;
    
    const updatedCartSummary = {
      ...state.cartSummary,
      items: updatedItems,
      totalItems: updatedItems.length,
      totalQuantity,
      subtotal,
      estimatedTax,
      estimatedShipping,
      estimatedTotal
    };
    
    return {
      ...state,
      cartSummary: updatedCartSummary,
      cartCount: totalQuantity,
      removingItems: state.removingItems.filter(id => id !== productId),
      error: null,
      lastSyncTimestamp: Date.now()
    };
  }),
  on(CartActions.removeFromCartFailure, (state, { error }) => ({
    ...state,
    removingItems: [],
    error
  })),

  // Clear Cart
  on(CartActions.clearCart, (state) => ({
    ...state,
    clearing: true,
    error: null
  })),
  on(CartActions.clearCartSuccess, (state) => ({
    ...state,
    cartSummary: initialCartState.cartSummary,
    cartCount: 0,
    clearing: false,
    error: null,
    lastSyncTimestamp: Date.now()
  })),
  on(CartActions.clearCartFailure, (state, { error }) => ({
    ...state,
    clearing: false,
    error
  })),

  // Load Cart Count
  on(CartActions.loadCartCount, (state) => ({
    ...state,
    error: null
  })),
  on(CartActions.loadCartCountSuccess, (state, { count }) => ({
    ...state,
    cartCount: count,
    error: null
  })),
  on(CartActions.loadCartCountFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // Transfer Guest Cart
  on(CartActions.transferGuestCart, (state) => ({
    ...state,
    transferring: true,
    error: null
  })),
  on(CartActions.transferGuestCartSuccess, (state) => ({
    ...state,
    transferring: false,
    error: null
  })),
  on(CartActions.transferGuestCartFailure, (state, { error }) => ({
    ...state,
    transferring: false,
    error
  })),

  // Validate Cart
  on(CartActions.validateCart, (state) => ({
    ...state,
    validating: true,
    error: null
  })),
  on(CartActions.validateCartSuccess, (state, { validationResults }) => ({
    ...state,
    validationResults,
    validating: false,
    error: null
  })),
  on(CartActions.validateCartFailure, (state, { error }) => ({
    ...state,
    validating: false,
    error
  })),

  // UI State
  on(CartActions.setCartLoading, (state, { loading }) => ({
    ...state,
    loading
  })),
  on(CartActions.setCartError, (state, { error }) => ({
    ...state,
    error
  })),
  on(CartActions.clearCartError, (state) => ({
    ...state,
    error: null
  })),

  // Local Storage
  on(CartActions.loadCartFromLocalStorageSuccess, (state, { cartSummary }) => ({
    ...state,
    cartSummary,
    cartCount: cartSummary.totalQuantity,
    lastSyncTimestamp: Date.now()
  })),

  // Sync
  on(CartActions.cartSyncReceived, (state, { cartSummary }) => {
    // Only update if the received data is newer
    const receivedTimestamp = Date.now();
    if (receivedTimestamp > state.lastSyncTimestamp) {
      return {
        ...state,
        cartSummary,
        cartCount: cartSummary.totalQuantity,
        lastSyncTimestamp: receivedTimestamp
      };
    }
    return state;
  })
);