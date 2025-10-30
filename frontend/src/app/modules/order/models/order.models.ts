export interface CreateOrderRequest {
  shippingAddressId: number;
  billingAddressId?: number;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  shippingAddressId?: number;
  billingAddressId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  statusHistory: OrderStatusHistory[];
  totalItemCount: number;
  canBeCancelled: boolean;
  canBeRefunded: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  discountAmount: number;
  hasDiscount: boolean;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  previousStatus?: string;
  newStatus: string;
  changedBy?: number;
  notes?: string;
  createdAt: string;
  statusUpgrade: boolean;
  systemChange: boolean;
}

export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus;
  notes?: string;
}

export interface CheckoutData {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Address {
  id?: number;
  type: 'SHIPPING' | 'BILLING';
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  cardholderName?: string;
  paypalEmail?: string;
}

export interface OrderSummary {
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  itemCount: number;
  currency: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}