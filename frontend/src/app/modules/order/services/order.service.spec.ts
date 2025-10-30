import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order, CreateOrderRequest, OrderStatus } from '../models/order.models';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const mockOrder: Order = {
    id: 1,
    orderNumber: 'ORD-001',
    userId: 1,
    status: OrderStatus.PENDING,
    subtotal: 199.98,
    taxAmount: 16.00,
    shippingAmount: 5.99,
    totalAmount: 221.97,
    paymentStatus: 'PENDING',
    items: [{
      id: 1,
      productId: 1,
      productSku: 'PROD-001',
      productName: 'Test Product',
      quantity: 2,
      unitPrice: 99.99,
      totalPrice: 199.98
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCreateOrderRequest: CreateOrderRequest = {
    userId: 1,
    shippingAddressId: 1,
    billingAddressId: 1,
    items: [{
      productId: 1,
      quantity: 2,
      unitPrice: 99.99
    }]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create order', () => {
    service.createOrder(mockCreateOrderRequest).subscribe(order => {
      expect(order).toEqual(mockOrder);
      expect(order.orderNumber).toBe('ORD-001');
    });

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCreateOrderRequest);
    req.flush(mockOrder);
  });

  it('should get order by id', () => {
    service.getOrderById(1).subscribe(order => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpMock.expectOne('/api/orders/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should get order by order number', () => {
    service.getOrderByOrderNumber('ORD-001').subscribe(order => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpMock.expectOne('/api/orders/number/ORD-001');
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should get user orders', () => {
    const mockOrders = [mockOrder];

    service.getUserOrders(1).subscribe(orders => {
      expect(orders).toEqual(mockOrders);
      expect(orders.length).toBe(1);
    });

    const req = httpMock.expectOne('/api/orders/user/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should update order status', () => {
    const updatedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };

    service.updateOrderStatus(1, OrderStatus.CONFIRMED).subscribe(order => {
      expect(order.status).toBe(OrderStatus.CONFIRMED);
    });

    const req = httpMock.expectOne('/api/orders/1/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: OrderStatus.CONFIRMED });
    req.flush(updatedOrder);
  });

  it('should cancel order', () => {
    const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

    service.cancelOrder(1).subscribe(order => {
      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    const req = httpMock.expectOne('/api/orders/1/cancel');
    expect(req.request.method).toBe('PUT');
    req.flush(cancelledOrder);
  });

  it('should handle create order error', () => {
    service.createOrder(mockCreateOrderRequest).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('/api/orders');
    req.flush('Invalid order data', { status: 400, statusText: 'Bad Request' });
  });

  it('should get order status history', () => {
    const mockStatusHistory = [
      { status: OrderStatus.PENDING, timestamp: new Date(), notes: 'Order created' },
      { status: OrderStatus.CONFIRMED, timestamp: new Date(), notes: 'Order confirmed' }
    ];

    service.getOrderStatusHistory(1).subscribe(history => {
      expect(history).toEqual(mockStatusHistory);
      expect(history.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/orders/1/status-history');
    expect(req.request.method).toBe('GET');
    req.flush(mockStatusHistory);
  });

  it('should validate order before creation', () => {
    service.validateOrder(mockCreateOrderRequest).subscribe(isValid => {
      expect(isValid).toBe(true);
    });

    const req = httpMock.expectOne('/api/orders/validate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCreateOrderRequest);
    req.flush({ valid: true });
  });
});