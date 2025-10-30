import { CartSummary, CartItem } from '../models/cart.models';

export interface CartState {
  // Cart data
  cartSummary: CartSummary;
  cartCount: number;
  validationResults: CartItem[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Operation states
  addingToCart: boolean;
  updatingItems: number[]; // Product IDs being updated
  removingItems: number[]; // Product IDs being removed
  clearing: boolean;
  transferring: boolean;
  validating: boolean;
  
  // Sync state
  lastSyncTimestamp: number;
  syncEnabled: boolean;
}

export const initialCartState: CartState = {
  cartSummary: {
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    subtotal: 0,
    estimatedTax: 0,
    estimatedShipping: 0,
    estimatedTotal: 0,
    currency: 'USD'
  },
  cartCount: 0,
  validationResults: [],
  loading: false,
  error: null,
  addingToCart: false,
  updatingItems: [],
  removingItems: [],
  clearing: false,
  transferring: false,
  validating: false,
  lastSyncTimestamp: 0,
  syncEnabled: true
};