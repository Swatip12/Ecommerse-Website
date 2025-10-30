export interface CartItem {
  id?: number;
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  imageUrl?: string;
  quantity: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  estimatedTotal: number;
  currency: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartItemCount {
  count: number;
}

export interface CartValidationResult {
  productId: number;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  message?: string;
}