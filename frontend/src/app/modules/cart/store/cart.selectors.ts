import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.state';

// Feature selector
export const selectCartState = createFeatureSelector<CartState>('cart');

// Basic selectors
export const selectCartSummary = createSelector(
  selectCartState,
  (state) => state.cartSummary
);

export const selectCartItems = createSelector(
  selectCartSummary,
  (cartSummary) => cartSummary.items
);

export const selectCartCount = createSelector(
  selectCartState,
  (state) => state.cartCount
);

export const selectCartTotalQuantity = createSelector(
  selectCartSummary,
  (cartSummary) => cartSummary.totalQuantity
);

export const selectCartSubtotal = createSelector(
  selectCartSummary,
  (cartSummary) => cartSummary.subtotal
);

export const selectCartTotal = createSelector(
  selectCartSummary,
  (cartSummary) => cartSummary.estimatedTotal
);

export const selectCartTax = createSelector(
  selectCartSummary,
  (cartSummary) => cartSummary.estimatedTax
);

export const selectCartShipping = createSelector(
  selectCartSummary,
  (cartSummary) => cartSummary.estimatedShipping
);

// UI state selectors
export const selectCartLoading = createSelector(
  selectCartState,
  (state) => state.loading
);

export const selectCartError = createSelector(
  selectCartState,
  (state) => state.error
);

export const selectAddingToCart = createSelector(
  selectCartState,
  (state) => state.addingToCart
);

export const selectUpdatingItems = createSelector(
  selectCartState,
  (state) => state.updatingItems
);

export const selectRemovingItems = createSelector(
  selectCartState,
  (state) => state.removingItems
);

export const selectCartClearing = createSelector(
  selectCartState,
  (state) => state.clearing
);

export const selectCartTransferring = createSelector(
  selectCartState,
  (state) => state.transferring
);

export const selectCartValidating = createSelector(
  selectCartState,
  (state) => state.validating
);

export const selectValidationResults = createSelector(
  selectCartState,
  (state) => state.validationResults
);

// Computed selectors
export const selectIsCartEmpty = createSelector(
  selectCartSummary,
  (cartSummary) => cartSummary.totalItems === 0
);

export const selectHasCartItems = createSelector(
  selectIsCartEmpty,
  (isEmpty) => !isEmpty
);

export const selectIsFreeShipping = createSelector(
  selectCartShipping,
  (shipping) => shipping === 0
);

export const selectFreeShippingThreshold = createSelector(
  selectCartState,
  () => 50 // $50 threshold for free shipping
);

export const selectAmountForFreeShipping = createSelector(
  selectCartSubtotal,
  selectFreeShippingThreshold,
  (subtotal, threshold) => Math.max(0, threshold - subtotal)
);

export const selectIsCloseToFreeShipping = createSelector(
  selectAmountForFreeShipping,
  (amount) => amount > 0 && amount <= 20
);

// Item-specific selectors
export const selectCartItemByProductId = (productId: number) =>
  createSelector(
    selectCartItems,
    (items) => items.find(item => item.productId === productId)
  );

export const selectIsProductInCart = (productId: number) =>
  createSelector(
    selectCartItems,
    (items) => items.some(item => item.productId === productId)
  );

export const selectProductQuantityInCart = (productId: number) =>
  createSelector(
    selectCartItems,
    (items) => {
      const item = items.find(item => item.productId === productId);
      return item ? item.quantity : 0;
    }
  );

export const selectIsItemUpdating = (productId: number) =>
  createSelector(
    selectUpdatingItems,
    (updatingItems) => updatingItems.includes(productId)
  );

export const selectIsItemRemoving = (productId: number) =>
  createSelector(
    selectRemovingItems,
    (removingItems) => removingItems.includes(productId)
  );

// Processing state selectors
export const selectIsCartProcessing = createSelector(
  selectCartLoading,
  selectAddingToCart,
  selectCartClearing,
  selectCartTransferring,
  selectUpdatingItems,
  selectRemovingItems,
  (loading, adding, clearing, transferring, updating, removing) =>
    loading || adding || clearing || transferring || updating.length > 0 || removing.length > 0
);

export const selectCanCheckout = createSelector(
  selectHasCartItems,
  selectIsCartProcessing,
  selectCartError,
  (hasItems, isProcessing, error) => hasItems && !isProcessing && !error
);

// Sync selectors
export const selectLastSyncTimestamp = createSelector(
  selectCartState,
  (state) => state.lastSyncTimestamp
);

export const selectSyncEnabled = createSelector(
  selectCartState,
  (state) => state.syncEnabled
);

// Summary statistics
export const selectCartStatistics = createSelector(
  selectCartSummary,
  selectIsCartEmpty,
  selectIsFreeShipping,
  selectAmountForFreeShipping,
  (cartSummary, isEmpty, isFreeShipping, amountForFreeShipping) => ({
    isEmpty,
    totalItems: cartSummary.totalItems,
    totalQuantity: cartSummary.totalQuantity,
    subtotal: cartSummary.subtotal,
    tax: cartSummary.estimatedTax,
    shipping: cartSummary.estimatedShipping,
    total: cartSummary.estimatedTotal,
    currency: cartSummary.currency,
    isFreeShipping,
    amountForFreeShipping
  })
);