export interface DashboardMetrics {
  orderStatistics: OrderStatistics;
  inventoryStatistics: InventoryStatistics;
  userStatistics: UserStatistics;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
  revenueByStatus: { [key: string]: number };
}

export interface InventoryStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  productsByCategory: { [key: string]: number };
  inventoryValueByCategory: { [key: string]: number };
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  customerUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersByRole: { [key: string]: number };
  userRegistrationsByMonth: { [key: string]: number };
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  salesByCategory: { [key: string]: number };
  salesTrend: SalesTrendData[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesTrendData {
  date: string;
  sales: number;
  orders: number;
}

export interface SystemConfiguration {
  siteName: string;
  siteDescription: string;
  currency: string;
  taxRate: number;
  shippingRate: number;
  lowStockThreshold: number;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  requireEmailVerification: boolean;
}

export interface UserManagement {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: 'CUSTOMER' | 'ADMIN';
  isActive?: boolean;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'CUSTOMER' | 'ADMIN';
}